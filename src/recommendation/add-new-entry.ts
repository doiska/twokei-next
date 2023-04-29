import { Twokei } from "../app/Twokei";
import { SongEntity } from "./schema/SongEntity";

interface RecommendationEntry {
  title: string;
  url?: string;
  author?: string;
}

export const addNewRecommendationEntry = async (member: string, guild: string, song: RecommendationEntry) => {

  const repo = Twokei.dataSource.getRepository(SongEntity);

  const songEntity = await repo.findOne({
    where: {
      user: member,
      guild: guild,
      song: song.url || song.title
    }
  });

  if (songEntity) {
    songEntity.count += 1;
    await repo.save(songEntity);
  } else {
    await repo.insert({
      user: member,
      guild: guild,
      song: song.url || song.title,
      count: 1
    });
  }
}