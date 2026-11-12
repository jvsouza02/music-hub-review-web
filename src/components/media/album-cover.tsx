"use client";

import { useState } from "react";
import Image from "next/image";
import { Disc3 } from "lucide-react";

import { cn } from "@/lib/utils";

type AlbumCoverProps = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
};

function isAllowedCoverArtUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === "coverartarchive.org" &&
      url.pathname.startsWith("/release/")
    );
  } catch {
    return false;
  }
}

export function AlbumCover({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 220px",
}: AlbumCoverProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const imageSrc = src && isAllowedCoverArtUrl(src) ? src : null;

  const shouldShowFallback = !imageSrc || failedSrc === imageSrc;

  return (
    <div
      data-slot="album-cover"
      className={cn(
        "relative isolate aspect-square w-full min-w-0 overflow-hidden rounded-xl bg-muted",
        className,
      )}
    >
      {shouldShowFallback ? (
        <div
          role="img"
          aria-label={
            alt
              ? `${alt} — capa indisponível`
              : "Capa de álbum indisponível"
          }
          className="absolute inset-0 flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-accent text-muted-foreground"
        >
          <Disc3 aria-hidden="true" className="size-12 opacity-60" />
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={sizes}
          loading="lazy"
          className="absolute inset-0 h-full w-full max-w-none object-cover object-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
          onError={() => setFailedSrc(imageSrc)}
        />
      )}
    </div>
  );
}