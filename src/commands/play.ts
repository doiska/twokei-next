import { ActionRowBuilder, APIEmbed, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command, container } from '@sapphire/framework';
import { isGuildMember } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';

import { resolveKey } from 'twokei-i18next';
import { getRandomLoadingMessage } from '@/utils/utils';
import { Embed } from '@/utils/messages';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { addNewSong } from '@/music/heizou/add-new-song';
import { playerLogger } from '@/modules/logger-transport';

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
      .addStringOption((option) => option.setName('search')
        .setDescription('Input')
        .setRequired(true)));
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

    await container.client.replyTo(
      interaction,
      {
        description: await resolveKey(interaction, getRandomLoadingMessage()) as string,
      },
      15,
    );

    try {
      const result = await addNewSong(search, interaction.member);

      const [track, ...rest] = result.tracks;

      const trackTranslation = await resolveKey(interaction,
        rest.length === 0 ? 'song_added' : 'playlist_added',
        {
          track: track.title,
          track_count: rest.length,
          ns: 'player',
          defaultValue: 'Song added: {{track}}',
        });

      playerLogger.info(`${interaction.member.user.tag} added ${track.title} to the queue.`, {
        guildId,
        track,
      });

      const likeButton = new ButtonBuilder()
        .setCustomId('like')
        .setLabel('Like')
        .setStyle(ButtonStyle.Primary);

      const dislikeButton = new ButtonBuilder()
        .setCustomId('dislike')
        .setLabel('Dislike')
        .setStyle(ButtonStyle.Danger);

      const viewOnSource = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(`View on ${track.sourceName}`)
        .setURL(track.uri);

      const row = new ActionRowBuilder<ButtonBuilder>();
      row.addComponents(likeButton, dislikeButton, viewOnSource);

      const responseEmbed = Embed.success(trackTranslation, {
        author: {
          name: `Requested by ${interaction.member.user.tag}!`,
          icon_url: interaction.member.user.displayAvatarURL(),
        },
        title: track.title,
        url: track.uri,
        thumbnail: {
          url: track.thumbnail ?? '',
        },
        description: '\n\nLike the song to add it to your liked songs!\nOr dislike to not hear it again.',
      });

      await container.client.replyTo(interaction, {
        embeds: [responseEmbed as APIEmbed],
        components: [row],
      });
    } catch (error) {
      await container.client.replyTo(
        interaction,
        Embed.error(await getReadableException(error, interaction.guild)),
      );
    }
  }
}
