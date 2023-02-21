import { CommandContext, CommandResponse, createCommand, MessageBuilder } from 'twokei-framework';

import { addNewSong } from '../music/heizou/add-new-song';
import { i18nGuild } from '../translation/guild-i18n';
import { getReadableException } from '../exceptions/utils/get-readable-exception';

const execute = async (context: CommandContext<{ search: string }>): Promise<CommandResponse> => {
  if (!context.member || !context.channel) {
    return;
  }

  try {
    const result = await addNewSong(context.input.search, context.member);
    const [track, ...rest] = result.tracks;

    const trackTranslation = await i18nGuild(context.guild!.id, rest.length === 0 ? 'song_added' : 'playlist_added', {
      track: track.title,
      rest: rest.length,
      ns: 'player'
    });

    return new MessageBuilder({ embeds: [{ description: trackTranslation }] });
  } catch (e) {
    return getReadableException(e);
  }
}

export const playCommand = createCommand({
  name: 'play',
  description: 'Play a song',
  slash: (builder) => {
    return builder
      .addStringOption((option) =>
        option
          .setName('search')
          .setDescription('Input')
          .setRequired(true)
      )
  },
  execute: execute
});