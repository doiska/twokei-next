import { and, eq } from 'drizzle-orm';
import { kil } from '@/db/Kil';
import { songProfileActions } from '@/db/schemas/song-profile-actions';

export class SongProfileActionManager {
  public async toggleLike (requester: string, target: string) {
    if (await this.isLiked(requester, target)) {
      await kil.delete(songProfileActions)
        .where(and(
          eq(songProfileActions.userId, requester),
          eq(songProfileActions.targetId, target),
          eq(songProfileActions.action, 'like'),
        ));
    } else {
      await kil.insert(songProfileActions)
        .values({
          action: 'like',
          userId: requester,
          targetId: target,
        });
    }
  }

  public async isLiked (user: string, target: string) {
    const response = await kil.select()
      .from(songProfileActions)
      .where(and(
        eq(songProfileActions.userId, user),
        eq(songProfileActions.targetId, target),
        eq(songProfileActions.action, 'like'),
      ));

    return response.length > 0;
  }
}
