import { Interaction } from 'discord.js';

import { and, eq, ilike } from 'drizzle-orm';
import { t } from 'i18next';
import { CommandContext, CommandResponse, createCommand, MessageBuilder } from 'twokei-framework';

import { kil } from '../../db/Kil';
import { playlists } from '../../db/schemas/Playlists';
import { addNewSong } from '../../music/heizou/add-new-song';
import { getReadableException } from '../../structures/exceptions/utils/get-readable-exception';


const execute = async (context: CommandContext<{ name: string }>): Promise<CommandResponse> => {

  const { user, input: { name } } = context;

  if (!context.member || !context.channel || !context.guild) {
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

    const trackTranslation = await t(rest.length === 0 ? 'song_added' : 'playlist_added', {
      track: track.title,
      rest: rest.length,
      ns: 'player'
    });

    const message = new MessageBuilder({ embeds: [{ description: trackTranslation }] });

    await message.followUp(context.interaction as Interaction);
  } catch (e) {
    return getReadableException(e);
  }
};

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
      );
  },
  execute: execute
});