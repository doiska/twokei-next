import type { Message, ModalSubmitInteraction, RepliableInteraction } from 'discord.js';
import { isGuildMember, isTextChannel } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { noop } from '@sapphire/utilities';

import { createPlayEmbed, waitFeedback } from '@/constants/music/create-play-embed';
import { OnPlayButtons } from '@/constants/music/player-buttons';
import { addNewSong } from '@/music/heizou/add-new-song';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { sendPresetMessage } from '@/utils/utils';

export async function playSong (interaction: Exclude<RepliableInteraction, ModalSubmitInteraction> | Message, query: string) {
  const { guild } = interaction;

  if (!guild || !interaction.member || !isGuildMember(interaction.member)) {
    return;
  }

  // await sendPresetMessage({
  //   interaction,
  //   preset: 'loading',
  // });

  const { channelId } = await container.sc.get(guild) ?? {};

  if (!channelId) {
    await sendPresetMessage({
      interaction,
      preset: 'error',
      message: ErrorCodes.MISSING_SONG_CHANNEL,
      ephemeral: true,
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
    const result = await addNewSong(query, interaction.member);

    if (!isSongChannel) {
      await sendPresetMessage({
        interaction,
        preset: 'success',
        message: 'Acompanhe e controle a música no canal #song-requests',
      });
    }

    const playMessage = await songChannel.send(await createPlayEmbed(interaction.member, result));
    const feedback = await waitFeedback(playMessage);

    feedback.on('collect', async collected => {
      if (!isGuildMember(collected.member)) {
        return;
      }

      await container.analytics.track({
        userId: collected.member.id,
        event: collected.customId === OnPlayButtons.LIKE ? 'like_song' : 'dislike_song',
        source: 'Guild',
        properties: {
          track: result.tracks?.[0].short(),
        },
      });

      await sendPresetMessage({
        interaction: collected,
        preset: 'success',
        ephemeral: true,
      });
    });

    setTimeout(() => {
      playMessage.delete().catch(noop);
    }, 15000);
  } catch (error) {
    await sendPresetMessage({
      interaction,
      preset: 'error',
      message: getReadableException(error),
    });
  }
}