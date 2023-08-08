import { type User } from 'discord.js';

import { and, eq, sql } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { songProfileActions } from '@/db/schemas/song-profile-actions';
import {
  songSource,
} from '@/db/schemas/song-source';
import { userSongEvents } from '@/db/schemas/user-song-events';
import { type RegisteredUser, users } from '@/db/schemas/users';

import { SongProfileActionManager } from '@/features/song-profile/SongProfileActionManager';
import { DEFAULT_LOCALE } from '@/locales/i18n';

export class SongProfileManager {
  public actions: SongProfileActionManager;

  constructor () {
    this.actions = new SongProfileActionManager();
  }

  public async get (user: User) {
    const [profile, ranking] = await Promise.all([
      this.getProfile(user),
      this.getUserRanking(user),
    ]);

    const [listenedTo] = await kil.select({
      count: sql<number>`COUNT(*)`.as('count'),
    })
      .from(userSongEvents)
      .where(and(eq(userSongEvents.userId, user.id), eq(userSongEvents.event, 'play_song')));

    const sources = await kil
      .select({
        source: songSource.source,
        sourceUrl: songSource.sourceUrl,
        createdAt: songSource.createdAt,
        updatedAt: songSource.updatedAt,
      })
      .from(songSource)
      .where(eq(songSource.userId, user.id));

    return {
      ...profile,
      sources: sources ?? [],
      ranking,
      analytics: {
        listenedSongs: listenedTo?.count ?? 0,
      },
    };
  }

  private async getProfile (user: User): Promise<RegisteredUser> {
    const [profile] = await kil
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!profile) {
      await kil
        .insert(users)
        .values({
          id: user.id,
          name: user.username,
          locale: DEFAULT_LOCALE,
        })
        .onConflictDoNothing();

      const result = await kil
        .insert(users)
        .values({
          id: user.id,
          name: user.username,
        })
        .returning();

      return result?.[0];
    }

    return profile;
  }

  private async getUserRanking (user: User) {
    const ranking = kil.$with('rank')
      .as(
        kil.select({
          targetId: songProfileActions.targetId,
          likeCount: sql<number>`COUNT(*)`.as('like_count'),
          position: sql<number>`RANK() OVER (ORDER BY COUNT(*) DESC)`
            .as('position'),
        })
          .from(songProfileActions)
          .groupBy(songProfileActions.targetId),
      );

    const [userRanking] = await kil.with(ranking)
      .select({
        likes: ranking.likeCount,
        position: ranking.position,
      })
      .from(ranking)
      .where(eq(ranking.targetId, user.id));

    return userRanking;
  }

  // private async getTopRanking (max = 5) {
  //   const subQuery = kil
  //     .select({
  //       targetId: songProfileActions.targetId,
  //       likeCount: sql<number>`COUNT(*)`.as('like_count'),
  //     })
  //     .from(songProfileActions)
  //     .groupBy(songProfileActions.targetId)
  //     .as('sq');
  //
  //   const ranking = await kil
  //     .select({
  //       likes: subQuery.likeCount,
  //       position: sql<number>`RANK() OVER (ORDER BY like_count DESC) as position`,
  //     })
  //     .from(subQuery)
  //     .limit(max);
  //
  //   console.log(ranking);
  // }
}
