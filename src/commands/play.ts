import { CommandContext, CommandResponse, createCommand } from 'twokei-framework';

import { PlayerException } from '../structures/PlayerException';
import { addNewSong } from '../music/heizou/add-new-song';
import { i18nGuild } from '../translation/guild-i18n';
import { MessageBuilder } from '../structures/MessageBuilder';
import { EmbedBuilder, TextChannel } from 'discord.js';

const execute = async (context: CommandContext<{ search: string }>): Promise<CommandResponse> => {

  if (!context.member || !context.channel) {
    return;
  }

  try {
    const [track, ...rest] = await addNewSong(context.input.search, context.member);

    const trackTranslation = await i18nGuild(context.guild!.id, rest.length === 0 ? 'song_added' : 'playlist_added', {
      track: track.info.title,
      rest: rest.length,
      ns: 'player'
    });

    await new MessageBuilder().setEmbeds(new EmbedBuilder().setDescription(trackTranslation)).send(context.channel as TextChannel);
  } catch (e) {
    if (e instanceof PlayerException) {
      return e.message;
    }

    return i18nGuild(context.guild!.id, 'unknown', { ns: 'error' });
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