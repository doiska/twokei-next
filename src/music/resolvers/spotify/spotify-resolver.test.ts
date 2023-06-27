import {beforeAll, describe, expect, it} from 'vitest';

import {LoadType} from '../../interfaces/player.types';
import {SpotifyResolver} from './spotify-resolver';

describe('SpotifyResolver', () => {

  let resolver: SpotifyResolver;

  beforeAll(() => {
    resolver = new SpotifyResolver();
  });

  it('should match 2/3 urls as spotify valids', () => {
    expect(resolver.matches('https://open.spotify.com/track/7mykoq6R3BArsSpNDjFQTm')).toBe(true);
    // noinspection HttpUrlsUsage
    expect(resolver.matches('http://open.spotify.com/track/7mykoq6R3BArsSpNDjFQTm')).toBe(true);
    expect(resolver.matches('https://music.youtube.com/watch?v=Pj-xhHOyvag&list=RDAMVMPj-xhHOyvag')).toBe(false);
  });

  describe('resolve - getTrack', () => {
    it('should resolve a track successfully', async () => {
      await expect(resolver.resolve('https://open.spotify.com/track/7mykoq6R3BArsSpNDjFQTm')).toBeDefined();
    });

    it('should fail while resolving a track', async () => {
      await expect(resolver.resolve('https://open.spotify.com/track/ddddd7mykoq6R3BArsSpNDjFQTm')).rejects.toThrow();
    });
  });

  describe('resolve - search', () => {
    it('should return a collection of tracks', async () => {
      const resolvers = await resolver.search('The Weeknd - Blinding Lights');

      console.log(resolvers);

      expect(resolvers).toBeDefined();
      expect(resolvers.type).toBe(LoadType.SEARCH_RESULT);
    });
  });
});