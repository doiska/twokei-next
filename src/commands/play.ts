import { Command, container } from '@sapphire/framework';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';

import { fetchT } from 'twokei-i18next';
import { getRandomLoadingMessage } from '@/utils/utils';
import { Embed } from '@/utils/messages';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { addNewSong } from '@/music/heizou/add-new-song';
import { createPlayEmbed } from '@/constants/music/create-play-embed';

@ApplyOptions<Command.Options>({
  name: 'play',
  aliases: ['p'],
  description: 'ping pong',
  enabled: true,
  preconditions: ['GuildTextOnly'],
  cooldownDelay: 1_000,
})
export class PlayCommand extends Command {
  registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => builder
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(
        (option) => option.setName('search')
          .setDescription('Input')
          .setRequired(true),
      ));
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const search = interaction.options.getString('search');

    const { member } = interaction;

    if (!member || !isGuildMember(member)) {
      return;
    }

    if (!search) {
      return;
    }

    const t = await fetchT(interaction);

    await container.client.replyTo(
      interaction,
      {
        description: t(getRandomLoadingMessage()) as string,
      },
      15,
    );

    try {
      const result = await addNewSong(search, member);
      const embedResult = createPlayEmbed(t, member, result);

      await container.client.replyTo(interaction, embedResult);
    } catch (error) {
      await container.client.replyTo(
        interaction,
        Embed.error(await getReadableException(error, interaction.guild)),
      );
    }
  }
}
