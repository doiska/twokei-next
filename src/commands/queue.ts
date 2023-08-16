import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { Command, container } from '@sapphire/framework';

import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { sendPresetMessage } from '@/utils/utils';

@ApplyOptions<Command.Options>({
  name: 'queue',
  description: 'View the queue',
  enabled: true,
  preconditions: ['GuildOnly'],
  cooldownDelay: 1_000,
})
export class PlayCommand extends Command {
  public registerApplicationCommands (registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => builder
      .setName(this.name)
      .setDescription(this.description));
  }

  public override async chatInputRun (
    interaction: Command.ChatInputCommandInteraction,
  ) {
    if (!interaction.guild || !isGuildMember(interaction.member)) {
      return;
    }

    const player = container.xiao.getPlayer(interaction.guild);

    if (!player) {
      await sendPresetMessage({
        message: ErrorCodes.NO_PLAYER_FOUND,
        preset: 'error',
        interaction,
      });
      return;
    }

    const { queue } = player;

    const trackList = queue
      .filter(Boolean)
      .map(
        (track, index) => `${index + 1}. [${track?.title}](${queue.current?.uri ?? ''})`,
      );

    await container.reply(interaction, {
      title: queue.current?.title ?? '',
      url: queue.current?.uri ?? '',
      thumbnail: {
        url: queue.current?.thumbnail ?? '',
      },
      description: trackList.join('\n'),
    }, 20);
  }
}
