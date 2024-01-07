import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { env } from "@/app/env";

export const Spotify = SpotifyApi.withClientCredentials(
  env.SPOTIFY_CLIENT_ID,
  env.SPOTIFY_CLIENT_SECRET,
);
