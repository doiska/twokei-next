import { CommandContext, CommandResponse, createCommand, MessageBuilder } from 'twokei-framework';
import { addNewSong } from '../../music/heizou/add-new-song';
import { i18nGuild } from '../../i18n/guild-i18n';
import { Interaction } from 'discord.js';
import { getReadableException } from '../../structures/exceptions/utils/get-readable-exception';
import { kil } from '../../app/Kil';
import { playlists } from '../../schemas/Playlists';
import { and, eq, ilike } from 'drizzle-orm';

const execute = async (context: CommandContext<{ name: string }>): Promise<CommandResponse> => {

  const { user, input: { name } } = context;

  if (!context.member) {
    return;
  }

  const [playlist] = await kil.select()
    .from(playlists)
    .where(and(eq(playlists.userId, user.id), ilike(playlists.playlistName, name)));

  if (!playlist) {
    return 'Playlist not found';
  }

  try {
    const result = await addNewSong(playlist.playlistUrl, context.member);
    const [track, ...rest] = result.tracks;

    const trackTranslation = await i18nGuild(context.guild!.id, rest.length === 0 ? 'song_added' : 'playlist_added', {
      track: track.title,
      rest: rest.length,
      ns: 'player'
    });

    const message = new MessageBuilder({ embeds: [{ description: trackTranslation }] });

    await message.followUp(context.interaction as Interaction);
  } catch (e) {
    return getReadableException(e);
  }
}

export const syncCommand = createCommand({
  name: 'load',
  description: 'Load playlist',
  slash: (builder) => {
    return builder
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('Playlist name')
          .setRequired(true)
      )
  },
  execute: execute
});