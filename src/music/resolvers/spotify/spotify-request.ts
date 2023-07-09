const BASE_URL = 'https://api.spotify.com/v1';
const AUTH_URL = 'https://accounts.spotify.com/api/token?grant_type=client_credentials';

export class SpotifyRequest {
  public currentApiStatus = {
    requests: 0,
    rateLimited: false,
  };

  private token = '';

  private expiresAt = 0;

  private readonly authorization: string = '';

  constructor({
    clientId,
    clientSecret,
  }: {
    clientId: string;
    clientSecret: string;
  }) {
    this.authorization = `Basic ${Buffer.from(
      `${clientId}:${clientSecret}`,
    )
      .toString('base64')}`;
  }

  public async request<T>(endpoint: string, useUri = false): Promise<T> {
    if (this.expiresAt < Date.now()) {
      await this.refresh();
    }

    if (this.currentApiStatus.rateLimited) {
      throw new Error('Spotify API is rate limited');
    }

    if (endpoint.startsWith('/')) {
      endpoint = endpoint.slice(1);
    }

    const route = useUri ? endpoint : `${BASE_URL}/${endpoint}`;

    const request = await fetch(route, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (request.headers.get('X-RateLimit-Remaining') === '0') {
      this.currentApiStatus.rateLimited = true;
      throw new Error('Spotify API is rate limited');
    }

    this.currentApiStatus.requests += 1;

    const data = await request.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data as T;
  }

  private async refresh() {
    const request = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        Authorization: this.authorization,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, expires_in } = (await request.json()) as {
      access_token: string;
      expires_in: number;
    };

    if (!access_token) {
      throw new Error('Failed to refresh token');
    }

    this.token = access_token;
    this.expiresAt = Date.now() + expires_in * 1000;
  }
}
