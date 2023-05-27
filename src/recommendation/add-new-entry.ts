import { kil } from '../app/Kil';
import { playedSongs } from '../schemas/PlayedSongs';
import { and, eq, sql } from 'drizzle-orm';

interface RecommendationEntry {
  title: string;
  url?: string;
  author?: string;
  length?: number;
}

export const addNewRecommendationEntry = async (member: string, guild: string, song: RecommendationEntry) => {
  if (!song.url) {
    return;
  }

  const [count] = await kil.select().from(playedSongs).where(and(
    eq(playedSongs.userId, member),
    eq(playedSongs.guildId, guild),
    eq(playedSongs.songUrl, song.url)
  ));

  if (count) {
    await kil.update(playedSongs).set({
      amount: sql`${playedSongs.amount} + 1`
    }).where(and(
      eq(playedSongs.userId, member),
      eq(playedSongs.guildId, guild),
      eq(playedSongs.songUrl, song.url)
    ));

    return;
  }

  await kil.insert(playedSongs).values({
    userId: member,
    guildId: guild,
    songName: song.title,
    songUrl: song.url || '',
    songLength: song.length || 0
  });
}