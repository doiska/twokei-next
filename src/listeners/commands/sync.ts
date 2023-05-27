import { CommandContext, CommandResponse, createCommand } from 'twokei-framework';
import { getReadableException } from '../../structures/exceptions/utils/get-readable-exception';
import { LoadType } from '../../music/interfaces/player.types';
import { Twokei } from '../../app/Twokei';
import { kil } from '../../app/Kil';
import { playlists } from '../../schemas/Playlists';
import { and, eq } from 'drizzle-orm';

const execute = async (context: CommandContext<{ url: string }>): Promise<CommandResponse> => {

  const { user, guild, input: { url } } = context;

  if (!guild) {
    return;
  }

  try {
    const resolver = await Twokei.xiao.getMatchingResolver(url);

    if (!resolver) {
      return 'Invalid playlist, empty or not found';
    }

    const result = await resolver.validate(url);

    if (result.type !== LoadType.PLAYLIST_LOADED) {
      return 'Invalid playlist, empty or not found';
    }

    const [response] = await kil.select()
      .from(playlists)
      .where(and(eq(playlists.userId, user.id), eq(playlists.playlistUrl, url)));

    if(response) {
      return `Playlist already synced: ${result.playlistName}`;
    }

    await kil.insert(playlists).values({
      playlistName: result.playlistName ?? 'Unamed playlist',
      userId: user.id,
      playlistUrl: url
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