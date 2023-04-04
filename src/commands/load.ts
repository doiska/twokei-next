import { CommandContext, CommandResponse, createCommand } from 'twokei-framework';
import { Twokei } from '../app/Twokei';
import { PlaylistEntity } from '../entities/PlaylistEntity';
import { addNewSong } from '../music/heizou/add-new-song';
import { i18nGuild } from '../translation/guild-i18n';
import { Interaction } from 'discord.js';
import { getReadableException } from '../exceptions/utils/get-readable-exception';
import { MessageBuilder } from 'twokei-framework';

const execute = async (context: CommandContext<{ name: string }>): Promise<CommandResponse> => {

  const { user, input: { name } } = context;

  if(!context.member) {
    return;
  }

  const playlist = await Twokei.dataSource.getRepository(PlaylistEntity).findOne({
    where: {
      name: name,
      user: user.id,
    }
  });

  if (!playlist) {
    return 'Playlist not found';
  }

  try {
    const result = await addNewSong(playlist.url, context.member);
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