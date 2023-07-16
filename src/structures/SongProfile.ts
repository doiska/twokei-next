import { eq } from 'drizzle-orm';

import { type User } from 'discord.js';

import { type SongProfileWithSources, songSource } from '@/db/schemas/song-source';
import { songProfileActions } from '@/db/schemas/song-profile-actions';
import { songProfile, type SongProfile } from '@/db/schemas/song-profile';
import { kil } from '@/db/Kil';

export class SongProfileManager {
  public async get (user: User): Promise<SongProfileWithSources> {
    const profile = await this.getProfile(user);

    const sources = await kil.select({
      source: songSource.source,
      sourceUrl: songSource.sourceUrl,
      createdAt: songSource.createdAt,
      updatedAt: songSource.updatedAt,
    })
      .from(songSource)
      .where(eq(songSource.userId, user.id));

    return {
      ...profile,
      sources,
    };
  }

  private async getProfile (user: User): Promise<SongProfile> {
    const [profile] = await kil.select()
      .from(songProfile)
      .where(eq(songProfile.userId, user.id))
      .limit(1);

    if (!profile) {
      const result = await kil.insert(songProfile)
        .values({
          userId: user.id,
          displayName: user.username,
        })
        .returning();

      return result?.[0];
    }

    return profile;
  }

  private async getActions (user: User) {
    const actions = await kil.select()
      .from(songProfileActions)
      .where(eq(songProfileActions.targetId, user.id))
      .limit(1);
  }
}
