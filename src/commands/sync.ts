import { CommandContext, CommandResponse, createCommand } from 'twokei-framework';
import { getReadableException } from '../exceptions/utils/get-readable-exception';
import { LoadType } from '../music/interfaces/player.types';
import { Twokei } from '../app/Twokei';
import { PlaylistEntity } from '../entities/PlaylistEntity';

const execute = async (context: CommandContext<{ url: string }>): Promise<CommandResponse> => {

  const { user, guild, input: { url } } = context;

  if (!guild) {
    return;
  }

  try {
    const resolver = await Twokei.xiao.getMatchingResolver(url);

    if(!resolver) {
      return 'Invalid playlist, empty or not found';
    }

    const result = await resolver.validate(url);

    if(result.type !== LoadType.PLAYLIST_LOADED) {
      return 'Invalid playlist, empty or not found';
    }

    await Twokei.dataSource.getRepository(PlaylistEntity).save({
      name: result.playlistName ?? 'Unamed playlist',
      user: user.id,
      url: url
    });

    return `Successfully synced playlist: ${result.playlistName} with ${result.amount} songs!`;
  } catch (error) {
    return getReadableException(error);
  }
}

export const syncCommand = createCommand({
  name: 'sync',
  description: 'Sync playlist',
  slash: (builder) => {
    return builder
      .addStringOption((option) =>
        option
          .setName('url')
          .setDescription('Playlist or Profile url')
          .setRequired(true)
      )
  },
  execute: execute
});