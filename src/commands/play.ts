import { ComponentType, type Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember, isTextChannel } from '@sapphire/discord.js-utilities';
import { Command, container } from '@sapphire/framework';
import { noop } from '@sapphire/utilities';

import { createPlayEmbed } from '@/constants/music/create-play-embed';
import { addNewSong } from '@/music/heizou/add-new-song';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { sendPresetMessage } from '@/utils/utils';

@ApplyOptions<Command.Options>({
  name: 'play',
  aliases: ['p'],
  description: 'ping pong',
  enabled: true,
  preconditions: ['GuildTextOnly'],
  cooldownDelay: 1_000,
})
export class PlayCommand extends Command {
  registerApplicationCommands (registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => builder
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(
        (option) => option.setName('search')
          .setDescription('Input')
          .setRequired(true),
      ));
  }

  public override async chatInputRun (
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const search = interaction.options.getString('search');

    const { member, guild } = interaction;

    if (!member || !isGuildMember(member) || !guild) {
      return;
    }

    if (!search) {
      return;
    }

    await sendPresetMessage({
      interaction,
      preset: 'loading',
    });

    const { channelId } = await container.sc.get(guild) ?? {};

    if (!channelId) {
      await sendPresetMessage({
        interaction,
        preset: 'error',
        message: ErrorCodes.MISSING_SONG_CHANNEL,
      });

      return;
    }

    const songChannel = await guild.channels.fetch(channelId)
      .catch(() => null);

    const isSongChannel = interaction.channel?.id === channelId;

    if (!songChannel || !isTextChannel(songChannel)) {
      await sendPresetMessage({
        interaction,
        preset: 'error',
        message: ErrorCodes.MISSING_SONG_CHANNEL,
      });

      return;
    }

    try {
      const result = await addNewSong(search, member);

      if (!isSongChannel) {
        await sendPresetMessage({
          interaction,
          preset: 'success',
          message: 'Acompanhe e controle a música no canal #song-requests',
        });
      }

      const playMessage = await songChannel.send(await createPlayEmbed(member, result));
      const feedback = await this.showFeedbackButtons(playMessage);

      if (['liked', 'disliked'].includes(feedback)) {
        await container.analytics.track({
          userId: interaction.user.id,
          event: feedback === 'liked' ? 'like_song' : 'dislike_song',
          source: 'Guild',
          properties: {
            track: result.tracks?.[0].short(),
          },
        });

        await sendPresetMessage({
          interaction,
          preset: 'success',
        });
      }

      await interaction.deleteReply()
        .catch(noop);

      await playMessage.delete();
    } catch (error) {
      await sendPresetMessage({
        interaction,
        preset: 'error',
        message: getReadableException(error),
      });
    }
  }

  private async showFeedbackButtons (message: Message) {
    return message.awaitMessageComponent({
      filter: (i) => ['like', 'dislike'].includes(i.customId),
      componentType: ComponentType.Button,
      time: 15000,
    })
      .then(i => i.customId === 'like' ? 'liked' : 'disliked')
      .catch(() => 'unanswered');
  }
}
