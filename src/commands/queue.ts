import { Command, container } from '@sapphire/framework';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';

import { resolveKey } from 'twokei-i18next';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';

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
      await container.client.replyTo(
        interaction,
        {
          description: await resolveKey(
            interaction.guild,
            ErrorCodes.NO_PLAYER_FOUND,
            { ns: 'error', defaultValue: 'No player found' },
          ) satisfies string ?? '',
        },
        15,
      ); return;
    }

    const { queue } = player;

    const trackList = queue
      .filter(Boolean)
      .map(
        (track, index) => `${index + 1}. [${track?.title}](${queue.current?.uri ?? ''})`,
      );

    void container.client.replyTo(interaction, {
      title: queue.current?.title ?? '',
      url: queue.current?.uri ?? '',
      thumbnail: {
        url: queue.current?.thumbnail ?? '',
      },
      description: trackList.join('\n'),
    }, 20);
  }
}
