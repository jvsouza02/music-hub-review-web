import 'server-only';

import { z } from 'zod';

import { getRedisClient } from '@/lib/auth/redis';

const CACHE_PREFIX = 'music-hub:media:artist-image:v1:';

const POSITIVE_CACHE_TTL = 7 * 24 * 60 * 60;
const NEGATIVE_CACHE_TTL = 12 * 60 * 60;

const MAX_ARTISTS_PER_BATCH = 20;

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
const COMMONS_API_ENDPOINT = 'https://commons.wikimedia.org/w/api.php';

const MBID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const artistImageSchema = z.object({
  url: z.string().url(),
  sourceUrl: z.string().url(),
  creator: z.string().nullable(),
  credit: z.string().nullable(),
  licenseName: z.string().nullable(),
  licenseUrl: z.string().url().nullable(),
  attributionRequired: z.boolean(),
});

const cachedImageSchema = z.object({
  image: artistImageSchema.nullable(),
});

const wikidataResponseSchema = z.object({
  results: z.object({
    bindings: z.array(
      z.object({
        musicBrainzId: z.object({
          value: z.string(),
        }),
        image: z.object({
          value: z.string(),
        }),
      }),
    ),
  }),
});

const metadataFieldSchema = z
  .object({
    value: z.string().optional(),
  })
  .passthrough();

const commonsResponseSchema = z
  .object({
    query: z.object({
      pages: z.array(
        z
          .object({
            title: z.string(),
            imageinfo: z
              .array(
                z
                  .object({
                    thumburl: z.string().optional(),
                    descriptionurl: z.string().optional(),
                    extmetadata: z
                      .object({
                        Artist: metadataFieldSchema.optional(),
                        Credit: metadataFieldSchema.optional(),
                        LicenseShortName: metadataFieldSchema.optional(),
                        LicenseUrl: metadataFieldSchema.optional(),
                        AttributionRequired: metadataFieldSchema.optional(),
                      })
                      .passthrough()
                      .optional(),
                  })
                  .passthrough(),
              )
              .optional(),
          })
          .passthrough(),
      ),
    }),
  })
  .passthrough();

export type ArtistImageInfo = z.infer<typeof artistImageSchema>;

type RedisClient = Awaited<ReturnType<typeof getRedisClient>>;

type ArtistImageMap = Record<string, ArtistImageInfo | null>;

function getWikimediaUserAgent(): string | null {
  const userAgent = process.env.WIKIMEDIA_USER_AGENT?.trim();

  if (!userAgent || !/\([^()]+\)/.test(userAgent)) {
    return null;
  }

  return userAgent;
}

function getCacheKey(mbid: string): string {
  return `${CACHE_PREFIX}${mbid}`;
}

function normalizeFileTitle(title: string): string {
  return title
    .replace(/^File:/i, '')
    .replaceAll('_', ' ')
    .normalize('NFC')
    .trim()
    .toLowerCase();
}

function extractCommonsFileTitle(value: string): string | null {
  try {
    const url = new URL(value);
    const prefix = '/wiki/Special:FilePath/';

    if (
      url.hostname !== 'commons.wikimedia.org' ||
      !url.pathname.startsWith(prefix)
    ) {
      return null;
    }

    const title = decodeURIComponent(
      url.pathname.slice(prefix.length),
    )
      .replaceAll('_', ' ')
      .trim();

    return title || null;
  } catch {
    return null;
  }
}

function isAllowedCommonsThumbnail(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      url.hostname === 'upload.wikimedia.org' &&
      url.pathname.startsWith('/wikipedia/commons/thumb/')
    );
  } catch {
    return false;
  }
}

function isAllowedCommonsPage(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      url.hostname === 'commons.wikimedia.org' &&
      url.pathname.startsWith('/wiki/File:')
    );
  } catch {
    return false;
  }
}

function normalizeHttpsUrl(value?: string): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== 'https:') {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function cleanMetadataText(value?: string): string | null {
  if (!value) {
    return null;
  }

  const text = value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => {
      const point = Number(code);

      return Number.isInteger(point) && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : '';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
      const point = Number.parseInt(code, 16);

      return Number.isInteger(point) && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : '';
    })
    .replace(/\s+/g, ' ')
    .trim();

  return text ? text.slice(0, 500) : null;
}

function parseCacheEntry(value: string): ArtistImageInfo | null | undefined {
  try {
    const parsed = cachedImageSchema.safeParse(JSON.parse(value));

    if (!parsed.success) {
      return undefined;
    }

    return parsed.data.image;
  } catch {
    return undefined;
  }
}

async function storeCacheEntries(
  redis: RedisClient | null,
  entries: Map<string, ArtistImageInfo | null>,
): Promise<void> {
  if (!redis || entries.size === 0) {
    return;
  }

  try {
    await Promise.all(
      Array.from(entries.entries()).map(([mbid, image]) =>
        redis.set(
          getCacheKey(mbid),
          JSON.stringify({ image }),
          {
            EX: image ? POSITIVE_CACHE_TTL : NEGATIVE_CACHE_TTL,
          },
        ),
      ),
    );
  } catch (error) {
    console.error('[ArtistImageResolver] Redis cache write failed.', error);
  }
}

async function fetchWikidataImageTitles(
  mbids: string[],
  userAgent: string,
): Promise<Map<string, string>> {
  const values = mbids.map((mbid) => `"${mbid}"`).join(' ');

  const query = `
    SELECT ?musicBrainzId ?image
    WHERE {
      VALUES ?musicBrainzId { ${values} }

      ?artist wdt:P434 ?musicBrainzId ;
              wdt:P18 ?image .
    }
    ORDER BY ?musicBrainzId ?image
  `;

  const response = await fetch(WIKIDATA_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/sparql-results+json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'User-Agent': userAgent,
    },
    body: new URLSearchParams({ query }).toString(),
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Wikidata returned HTTP ${response.status}.`);
  }

  const payload = wikidataResponseSchema.parse(await response.json());

  const imageTitles = new Map<string, string>();
  const requestedMbids = new Set(mbids);

  for (const binding of payload.results.bindings) {
    const mbid = binding.musicBrainzId.value.toLowerCase();

    if (!requestedMbids.has(mbid) || imageTitles.has(mbid)) {
      continue;
    }

    const title = extractCommonsFileTitle(binding.image.value);

    if (title) {
      imageTitles.set(mbid, title);
    }
  }

  return imageTitles;
}

async function fetchCommonsImages(
  fileTitles: string[],
  userAgent: string,
): Promise<Map<string, ArtistImageInfo>> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '512',
    titles: fileTitles.map((title) => `File:${title}`).join('|'),
  });

  const response = await fetch(`${COMMONS_API_ENDPOINT}?${params}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': userAgent,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Wikimedia Commons returned HTTP ${response.status}.`);
  }

  const payload = commonsResponseSchema.parse(await response.json());

  const images = new Map<string, ArtistImageInfo>();

  for (const page of payload.query.pages) {
    const imageInfo = page.imageinfo?.[0];

    if (!imageInfo?.thumburl || !imageInfo.descriptionurl) {
      continue;
    }

    if (
      !isAllowedCommonsThumbnail(imageInfo.thumburl) ||
      !isAllowedCommonsPage(imageInfo.descriptionurl)
    ) {
      continue;
    }

    const metadata = imageInfo.extmetadata;

    const attributionValue = (
      metadata?.AttributionRequired?.value ?? ''
    ).trim().toLowerCase();

    const image: ArtistImageInfo = {
      url: imageInfo.thumburl,
      sourceUrl: imageInfo.descriptionurl,
      creator: cleanMetadataText(metadata?.Artist?.value),
      credit: cleanMetadataText(metadata?.Credit?.value),
      licenseName: cleanMetadataText(metadata?.LicenseShortName?.value),
      licenseUrl: normalizeHttpsUrl(metadata?.LicenseUrl?.value),
      attributionRequired: ['true', '1', 'yes'].includes(attributionValue),
    };

    const validatedImage = artistImageSchema.safeParse(image);

    if (validatedImage.success) {
      images.set(normalizeFileTitle(page.title), validatedImage.data);
    }
  }

  return images;
}

async function resolveArtistImageBatch(
  mbids: string[],
  userAgent: string,
  redis: RedisClient | null,
  result: ArtistImageMap,
): Promise<void> {
  const imageTitles = await fetchWikidataImageTitles(mbids, userAgent);

  const cacheEntries = new Map<string, ArtistImageInfo | null>();

  const mbidsWithImages = mbids.filter((mbid) => imageTitles.has(mbid));

  for (const mbid of mbids) {
    if (!imageTitles.has(mbid)) {
      result[mbid] = null;
      cacheEntries.set(mbid, null);
    }
  }

  await storeCacheEntries(redis, cacheEntries);

  if (mbidsWithImages.length === 0) {
    return;
  }

  const uniqueTitles = Array.from(new Set(imageTitles.values()));

  const commonsImages = await fetchCommonsImages(uniqueTitles, userAgent);

  const resolvedEntries = new Map<string, ArtistImageInfo | null>();

  for (const mbid of mbidsWithImages) {
    const title = imageTitles.get(mbid);

    if (!title) {
      continue;
    }

    const image = commonsImages.get(normalizeFileTitle(title)) ?? null;

    result[mbid] = image;
    resolvedEntries.set(mbid, image);
  }

  await storeCacheEntries(redis, resolvedEntries);
}

export async function resolveArtistImages(
  artistMbids: string[],
): Promise<ArtistImageMap> {
  const mbids = Array.from(
    new Set(
      artistMbids
        .map((mbid) => mbid.trim().toLowerCase())
        .filter((mbid) => MBID_REGEX.test(mbid)),
    ),
  );

  const result: ArtistImageMap = Object.fromEntries(
    mbids.map((mbid) => [mbid, null]),
  );

  if (mbids.length === 0) {
    return result;
  }

  let redis: RedisClient | null = null;
  let missingMbids: string[] = [];

  try {
    redis = await getRedisClient();

    const cachedValues = await redis.mGet(
      mbids.map((mbid) => getCacheKey(mbid)),
    );

    for (const [index, mbid] of mbids.entries()) {
      const cachedValue = cachedValues[index];

      if (cachedValue === null || cachedValue === undefined) {
        missingMbids.push(mbid);
        continue;
      }

      const cachedImage = parseCacheEntry(cachedValue);

      if (cachedImage === undefined) {
        missingMbids.push(mbid);
        continue;
      }

      result[mbid] = cachedImage;
    }
  } catch (error) {
    console.error('[ArtistImageResolver] Redis cache read failed.', error);
    redis = null;
    missingMbids = [...mbids];
  }

  if (missingMbids.length === 0) {
    return result;
  }

  const userAgent = getWikimediaUserAgent();

  if (!userAgent) {
    console.warn(
      '[ArtistImageResolver] Configure WIKIMEDIA_USER_AGENT to enable image lookups.',
    );

    return result;
  }

  for (
    let index = 0;
    index < missingMbids.length;
    index += MAX_ARTISTS_PER_BATCH
  ) {
    const batch = missingMbids.slice(
      index,
      index + MAX_ARTISTS_PER_BATCH,
    );

    try {
      await resolveArtistImageBatch(batch, userAgent, redis, result);
    } catch (error) {
      console.error('[ArtistImageResolver] Image lookup failed.', error);
    }
  }

  return result;
}