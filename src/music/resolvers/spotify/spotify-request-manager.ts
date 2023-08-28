import { SpotifyRequest } from "./spotify-request";
import { type SpotifyResolverOptions } from "./spotify-track-resolver";

class SpotifyRequestManager {
  private readonly mode: "single" | "multiple" = "single";

  private readonly requests: SpotifyRequest[] = [];

  public options: SpotifyResolverOptions;

  constructor(options: SpotifyResolverOptions) {
    this.options = options;
    this.mode = options.clients.length > 1 ? "multiple" : "single";
    this.requests = options.clients.map((client) => new SpotifyRequest(client));
  }

  public async request<T>(endpoint: string, useUri = false): Promise<T> {
    const requester =
      this.mode === "single" ? this.requests[0] : this.getLeastUsedRequest();

    console.log(
      `Requesting ${endpoint} with ${requester.currentApiStatus.requests} requests made.`,
    );

    return await requester.request(endpoint, useUri);
  }

  private getLeastUsedRequest() {
    const isNotRateLimited = (request: SpotifyRequest) =>
      !request.currentApiStatus.rateLimited;

    const requests = this.requests.filter(isNotRateLimited);

    if (requests.length === 0) {
      throw new Error("All requests are rate limited");
    }

    requests.sort(
      (a, b) => a.currentApiStatus.requests - b.currentApiStatus.requests,
    );

    return requests[0];
  }
}

export const spotifyRequestManager = new SpotifyRequestManager({
  region: "BR",
  limits: {
    search: 5,
    playlists: 5,
    tracks: 5,
    albums: 10,
  },
  clients: [
    {
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
    },
  ],
});
