import { eq, sql } from 'drizzle-orm';

import { type User } from 'discord.js';

import {
  type SongProfileWithSources,
  songSource,
} from '@/db/schemas/song-source';
import { songProfileActions } from '@/db/schemas/song-profile-actions';
import { songProfile, type SongProfile } from '@/db/schemas/song-profile';
import { kil } from '@/db/Kil';
import { users } from '@/db/schemas/users';
import { DEFAULT_LOCALE } from '@/locales/i18n';

export class SongProfileManager {
  public async get (user: User) {
    const profile = await this.getProfile(user);

    const sources = await kil
      .select({
        source: songSource.source,
        sourceUrl: songSource.sourceUrl,
        createdAt: songSource.createdAt,
        updatedAt: songSource.updatedAt,
      })
      .from(songSource)
      .where(eq(songSource.userId, user.id));

    const ranking = await this.getUserRanking(user);

    return {
      ...profile,
      sources,
      ranking,
    };
  }

  private async getProfile (user: User): Promise<SongProfile> {
    const [profile] = await kil
      .select()
      .from(songProfile)
      .where(eq(songProfile.userId, user.id))
      .limit(1);

    if (!profile) {
      await kil
        .insert(users)
        .values({
          userId: user.id,
          name: user.username,
          locale: DEFAULT_LOCALE,
        })
        .onConflictDoNothing();

      const result = await kil
        .insert(songProfile)
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
    const actions = await kil
      .select()
      .from(songProfileActions)
      .where(eq(songProfileActions.targetId, user.id))
      .limit(1);
  }

  /*
   * https://orm.drizzle.team/docs/crud#with-clause
   * WITH ranked_likes AS (
   *     SELECT
   *         target_id,
   *         COUNT(*) AS like_count,
   *         RANK() OVER (ORDER BY COUNT(*) DESC) AS position
   *     FROM song_profile_actions
   *     WHERE action = 'like'
   *     GROUP BY target_id
   * )
   * SELECT target_id, like_count, position
   * FROM ranked_likes WHERE target_id = '226038466272690176'
   */

  private async getUserRanking (user: User) {
    const subQuery = kil
      .select({
        targetId: songProfileActions.targetId,
        likeCount: sql<number>`COUNT(*)`.as('like_count'),
        position: sql<number>`RANK() OVER (ORDER BY like_count DESC)`.as('position'),
      })
      .from(songProfileActions)
      .groupBy(songProfileActions.targetId)
      .as('sq');

    const [ranking] = await kil
      .select()
      .from(subQuery)
      .where(eq(subQuery.targetId, user.id));

    console.log(ranking);

    return ranking;
  }

  private async getTopRanking (max = 5) {
    const subQuery = kil
      .select({
        targetId: songProfileActions.targetId,
        likeCount: sql<number>`COUNT(*)`.as('like_count'),
      })
      .from(songProfileActions)
      .groupBy(songProfileActions.targetId)
      .as('sq');

    const ranking = await kil
      .select({
        likes: subQuery.likeCount,
        position: sql<number>`RANK() OVER (ORDER BY like_count DESC) as position`,
      })
      .from(subQuery)
      .limit(max);

    console.log(ranking);
  }
}
