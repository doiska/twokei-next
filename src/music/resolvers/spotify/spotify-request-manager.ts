import { SpotifyRequest } from './spotify-request';
import { SpotifyResolverOptions } from './spotify-resolver';

export class SpotifyRequestManager {

  private readonly mode: 'single' | 'multiple' = 'single';
  private readonly requests: SpotifyRequest[] = [];

  constructor(options: SpotifyResolverOptions) {
    this.mode = options.clients.length > 1 ? 'multiple' : 'single';
    this.requests = options.clients.map(client => new SpotifyRequest(client));
  }

  public request<T>(endpoint: string, useUri = false): Promise<T> {
   const requester = this.mode === 'single' ? this.requests[0] : this.getLeastUsedRequest();
    return requester.request(endpoint, useUri);
  }

  private getLeastUsedRequest() {
    const isNotRateLimited = (request: SpotifyRequest) => !request.currentApiStatus.rateLimited;

    const requests = this.requests.filter(isNotRateLimited);

    if(requests.length === 0) {
      throw new Error('All requests are rate limited');
    }

    requests.sort((a, b) => a.currentApiStatus.requests - b.currentApiStatus.requests);

    return requests[0];
  }
}