'use client';

import { useState } from 'react';
import Image from 'next/image';

import type { ArtistImageInfo } from '@/lib/media/artist-images.server';

type ArtistImageProps = {
  name: string;
  image: ArtistImageInfo | null;
};

function isAllowedImageUrl(value: string): boolean {
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

function isAllowedSourceUrl(value: string): boolean {
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

export function ArtistImage({ name, image }: ArtistImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const src = image?.url && isAllowedImageUrl(image.url) ? image.url : null;

  const showFallback = !src || failedSrc === src;

  const initials = name.trim().charAt(0).toUpperCase() || '?';

  const attribution = image
    ? [image.creator, image.credit, image.licenseName]
        .filter(Boolean)
        .join(' · ')
    : '';

  const imageElement = src ? (
    <Image
      src={src}
      alt={`Foto de ${name}`}
      fill
      sizes="56px"
      loading="lazy"
      className="object-cover"
      onError={() => setFailedSrc(src)}
    />
  ) : null;

  return (
    <div className="relative isolate size-14 shrink-0 overflow-hidden rounded-xl bg-linear-to-br from-primary/15 to-brand-cyan/15">
      {showFallback ? (
        <div
          role="img"
          aria-label={`Foto de ${name} indisponível`}
          className="flex size-full items-center justify-center font-heading text-xl font-bold text-primary"
        >
          {initials}
        </div>
      ) : image && isAllowedSourceUrl(image.sourceUrl) ? (
        <a
          href={image.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ver origem e licença da imagem de ${name}`}
          title={attribution || `Imagem de ${name} no Wikimedia Commons`}
          className="absolute inset-0"
        >
          {imageElement}
        </a>
      ) : (
        imageElement
      )}
    </div>
  );
}