import { type User } from "discord.js";

import { and, eq, sql } from "drizzle-orm";
import { kil } from "@/db/Kil";
import { songProfileActions } from "@/db/schemas/song-profile-actions";
import { songProfileSources } from "@/db/schemas/song-profile-sources";
import { songRanking } from "@/db/schemas/song-ranking";
import { coreUsers } from "@/db/schemas/core-users";

import { SongProfileActionManager } from "@/features/song-profile/SongProfileActionManager";
import { env } from "@/app/env";
import { logger } from "@/modules/logger-transport";

//TODO: refactor
export class SongProfileManager {
  public actions: SongProfileActionManager;

  constructor() {
    this.actions = new SongProfileActionManager();
  }

  public async get(target: User) {
    const [profile, ranking, premium] = await Promise.all([
      this.getProfile(target),
      this.getUserRanking(target),
      this.getUserRole(target.id),
    ]);

    const [followers] = await kil
      .select({
        amount: sql<number>`COUNT(*)`,
      })
      .from(songProfileActions)
      .where(
        and(
          eq(songProfileActions.targetId, target.id),
          eq(songProfileActions.action, "like"),
        ),
      )
      .groupBy(songProfileActions.targetId);

    const sources = await kil
      .select({
        source: songProfileSources.source,
        sourceUrl: songProfileSources.sourceUrl,
        createdAt: songProfileSources.createdAt,
        updatedAt: songProfileSources.updatedAt,
      })
      .from(songProfileSources)
      .where(eq(songProfileSources.userId, target.id));

    return {
      ...profile,
      role: premium,
      sources: sources ?? [],
      ranking,
      analytics: {
        followers: followers?.amount ?? 0,
      },
    };
  }

  private async getProfile(user: User) {
    const [profile] = await kil
      .select()
      .from(coreUsers)
      .where(eq(coreUsers.id, user.id));

    if (profile) {
      return profile;
    }

    const [result] = await kil
      .insert(coreUsers)
      .values({
        id: user.id,
        name: user.username,
      })
      .onConflictDoNothing()
      .returning();

    return result;
  }

  private async getUserRanking(user: User) {
    const [ranking] = await kil
      .select()
      .from(songRanking)
      .where(eq(songRanking.userId, user.id));

    return ranking;
  }

  private async getUserRole(userId: string) {
    logger.info(`${env.WEBSITE_URL}/api/user/${userId}`);

    const response = await fetch(`${env.WEBSITE_URL}/api/user/${userId}`, {
      headers: {
        Authorization: env.RESOLVER_KEY,
      },
    })
      .then((response) => response.json() as Promise<{ role: string }>)
      .catch((e) => {
        logger.error(e);
        return null;
      });

    if (!response) {
      logger.error(`Failed to fetch user role for ${userId}`);
      return;
    }

    return response.role;
  }
}
