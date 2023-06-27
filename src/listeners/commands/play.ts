import {t} from 'i18next';

import {Interaction} from 'discord.js';
import {CommandContext, CommandResponse, createCommand, MessageBuilder} from 'twokei-framework';


import {addNewSong} from '../../music/heizou/add-new-song';
import {getReadableException} from '../../structures/exceptions/utils/get-readable-exception';

const execute = async (context: CommandContext<{ search: string }>): Promise<CommandResponse> => {
  if (!context.member || !context.channel || !context.guild) {
    return;
  }

  try {
    const result = await addNewSong(context.input.search, context.member);
    const [track, ...rest] = result.tracks;

    const trackTranslation = await t(rest.length === 0 ? 'song_added' : 'playlist_added', {
      track: track.title,
      rest: rest.length,
      ns: 'player'
    });

    const message = new MessageBuilder({embeds: [{description: trackTranslation}]});

    await message.followUp(context.interaction as Interaction);
  } catch (e) {
    return getReadableException(e);
  }
};

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
      );
  },
  execute: execute
});