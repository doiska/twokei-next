import { ComponentType } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { Command, container } from '@sapphire/framework';
import { noop } from '@sapphire/utilities';

import { createPlayEmbed } from '@/constants/music/create-play-embed';
import { addNewSong } from '@/music/heizou/add-new-song';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { Embed } from '@/utils/messages';
import { sendPresetMessage } from '@/utils/utils';

import { fetchT } from 'twokei-i18next';

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

    const { member } = interaction;

    if (!member || !isGuildMember(member)) {
      return;
    }

    if (!search) {
      return;
    }

    const t = await fetchT(interaction);

    await sendPresetMessage({
      interaction,
      preset: 'loading',
    });

    try {
      const result = await addNewSong(search, member);
      const embedResult = createPlayEmbed(t, member, result);
      const replied = await interaction.editReply({ ...embedResult });

      replied.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id && ['like', 'dislike'].includes(i.customId),
        componentType: ComponentType.Button,
        time: 15000,
      })
        .then(async response => {
          await container.analytics.track({
            userId: interaction.user.id,
            event: response.customId === 'like' ? 'like_song' : 'dislike_song',
            source: 'Guild',
            properties: {
              track: result.tracks?.[0].short(),
            },
          });

          await sendPresetMessage({
            interaction,
            preset: 'success',
          });
        })
        .catch(noop)
        .finally(() => {
          interaction.deleteReply()
            .catch(noop);
        });
    } catch (error) {
      await container.reply(
        interaction,
        Embed.error(await getReadableException(error, interaction.guild)),
      );
    }
  }
}
