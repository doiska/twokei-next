import { type User } from 'discord.js';

import { and, eq, sql } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { songProfileActions } from '@/db/schemas/song-profile-actions';
import { songRanking } from '@/db/schemas/song-ranking';
import { songSource } from '@/db/schemas/song-source';
import { users } from '@/db/schemas/users';

import { SongProfileActionManager } from '@/features/song-profile/SongProfileActionManager';

export class SongProfileManager {
  public actions: SongProfileActionManager;

  constructor () {
    this.actions = new SongProfileActionManager();
  }

  public async get (target: User) {
    const [profile, ranking] = await Promise.all([
      this.getProfile(target),
      this.getUserRanking(target),
    ]);

    const [followers] = await kil.select({
      amount: sql<number>`COUNT(*)`,
    }).from(songProfileActions)
      .where(
        and(eq(songProfileActions.targetId, target.id), eq(songProfileActions.action, 'like')),
      )
      .groupBy(songProfileActions.targetId);

    const sources = await kil
      .select({
        source: songSource.source,
        sourceUrl: songSource.sourceUrl,
        createdAt: songSource.createdAt,
        updatedAt: songSource.updatedAt,
      })
      .from(songSource)
      .where(eq(songSource.userId, target.id));

    return {
      ...profile,
      sources: sources ?? [],
      ranking,
      analytics: {
        followers: followers?.amount ?? 0,
      },
    };
  }

  private async getProfile (user: User) {
    const [profile] = await kil.select()
      .from(users)
      .where(eq(users.id, user.id));

    if (profile) {
      return profile;
    }

    const [result] = await kil
      .insert(users)
      .values({
        id: user.id,
        name: user.username,
      })
      .onConflictDoNothing()
      .returning();

    return result;
  }

  private async getUserRanking (user: User) {
    const [ranking] = await kil.select().from(songRanking)
      .where(eq(songRanking.userId, user.id));

    return ranking;
  }

  // User Ranking by like
  // private async getUserRanking (user: User) {
  //   const ranking = kil.$with('rank')
  //     .as(
  //       kil
  //         .select({
  //           targetId: songProfileActions.targetId,
  //           likeCount: sql<number>`COUNT(*)`.as('like_count'),
  //           position: sql<number>`RANK() OVER (ORDER BY COUNT(*) DESC)`.as(
  //             'position',
  //           ),
  //         })
  //         .from(songProfileActions)
  //         .groupBy(songProfileActions.targetId),
  //     );
  //
  //   const [userRanking] = await kil
  //     .with(ranking)
  //     .select({
  //       likes: ranking.likeCount,
  //       position: ranking.position,
  //     })
  //     .from(ranking)
  //     .where(eq(ranking.targetId, user.id));
  //
  //   return userRanking;
  // }
}
