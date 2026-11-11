import type { PaginationParams } from "@/lib/api/pagination";

function resourceKeys(resource: string) {
  const all = ["music-hub", resource] as const;

  return {
    all,
    lists: () => [...all, "list"] as const,
    list: (params: PaginationParams = {}) =>
      [
        ...all,
        "list",
        {
          limit: params.limit ?? 20,
          offset: params.offset ?? 0,
        },
      ] as const,
    details: () => [...all, "detail"] as const,
    detail: (id: string) => [...all, "detail", id] as const,
  };
}

const artists = resourceKeys("artists");
const albums = resourceKeys("albums");
const tracks = resourceKeys("tracks");
const reviews = resourceKeys("reviews");
const users = resourceKeys("users");

export const queryKeys = {
  users: {
    ...users,
    current: () => [...users.all, "current"] as const,
    publicProfile: (userId: string) =>
      [...users.all, "public-profile", userId] as const,
  },

  artists: {
    ...artists,
    byMbid: (mbid: string) => [...artists.all, "mbid", mbid] as const,
    albums: (artistId: string) =>
      [...artists.detail(artistId), "albums"] as const,
  },

  albums: {
    ...albums,
    byMbid: (mbid: string) => [...albums.all, "mbid", mbid] as const,
    tracks: (albumId: string) =>
      [...albums.detail(albumId), "tracks"] as const,
  },

  tracks: {
    ...tracks,
    byMbid: (mbid: string) => [...tracks.all, "mbid", mbid] as const,
    search: (term: string) =>
      [...tracks.all, "search", term.trim()] as const,
  },

  reviews: {
    ...reviews,
    byUser: (userId: string, params: PaginationParams = {}) =>
      [
        ...reviews.all,
        "by-user",
        userId,
        { limit: params.limit ?? 20, offset: params.offset ?? 0 },
      ] as const,
    byTrack: (trackId: string, params: PaginationParams = {}) =>
      [
        ...reviews.all,
        "by-track",
        trackId,
        { limit: params.limit ?? 20, offset: params.offset ?? 0 },
      ] as const,
  },
};