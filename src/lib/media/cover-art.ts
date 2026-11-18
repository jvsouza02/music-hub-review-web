const MBID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getReleaseCoverUrl(
  albumMbid: string | null | undefined,
): string | null {
  if (!albumMbid) {
    return null;
  }

  const normalizedMbid = albumMbid.trim();

  if (!MBID_REGEX.test(normalizedMbid)) {
    return null;
  }

  return `https://coverartarchive.org/release/${normalizedMbid}/front-250`;
}