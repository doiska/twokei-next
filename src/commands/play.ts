import { t } from 'i18next';

import { ApplyOptions } from '@sapphire/decorators';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { Command } from '@sapphire/framework';

import { getGuidLocale } from '@/modules/guild-locale';
import { addNewSong } from '@/music/heizou/add-new-song';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { sendInteraction, sendLoadingMessage } from '@/utils/utils';

@ApplyOptions<Command.Options>({
  name: 'play',
  aliases: ['p'],
  description: 'ping pong',
  enabled: true,
})
export class PlayCommand extends Command {
  registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => builder
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) => option.setName('search').setDescription('Input').setRequired(true)));
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const search = interaction.options.getString('search');

    if (!interaction.member || !isGuildMember(interaction.member)) {
      return;
    }

    if (!search) {
      return;
    }

    const guildId = interaction.member.guild.id;

    const locale = await getGuidLocale(guildId);

    await sendLoadingMessage(interaction, locale);

    try {
      const result = await addNewSong(search, interaction.member);

      const [track, ...rest] = result.tracks;

      const trackTranslation = t(
        rest.length === 0 ? 'song_added' : 'playlist_added',
        {
          track: track.title,
          track_count: rest.length,
          ns: 'player',
          lng: locale,
        },
      );

      await sendInteraction(interaction, trackTranslation, 15000);
    } catch (error) {
      await sendInteraction(
        interaction,
        await getReadableException(error, guildId),
        15000,
      );
    }
  }
}
