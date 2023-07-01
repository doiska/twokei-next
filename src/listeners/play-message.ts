import { eq } from 'drizzle-orm';

import { ApplyOptions } from '@sapphire/decorators';
import { isGuildBasedChannel, isTextChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { fetchT, resolveKey } from '@sapphire/plugin-i18next';
import {
  Colors, EmbedBuilder, Events, Message,
} from 'discord.js';

import { kil } from '@/db/Kil';
import { songChannels } from '@/db/schemas/SongChannels';
import { logger } from '@/modules/logger-transport';
import { addNewSong } from '@/music/heizou/add-new-song';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { PlayerException } from '@/structures/exceptions/PlayerException';

@ApplyOptions<Listener.Options>({
  name: 'play-message-event',
  event: Events.MessageCreate,
})
export class PlayMessage extends Listener<Events.MessageCreate> {
  public override async run(message: Message) {
    const self = this.container.client.id;
    const { channel: typedChannel, member, guild } = message;

    if (!self || message.author.bot || !guild || !member) {
      return;
    }

    if (!isTextChannel(typedChannel) || !isGuildBasedChannel(typedChannel)) {
      return;
    }

    const contentOnly = message.content.replace(/<@!?\d+>/g, '').trim();
    const hasMentions = message.mentions.members?.has(self);

    const [songChannel] = await kil
      .select()
      .from(songChannels)
      .where(eq(songChannels.guildId, guild.id));

    const isUsableChannel = songChannel?.channelId === typedChannel.id;

    if (!isUsableChannel) {
      return;
    }

    await message.delete();

    const errorEmbed = new EmbedBuilder().setColor(Colors.Red);

    if (!hasMentions) {
      const ft = await fetchT(message);

      errorEmbed.setDescription(ft(ErrorCodes.MISSING_MESSAGE, {
        ns: 'error',
        joinArrays: '\n',
        mention: this.container.client.user?.toString(),
      }));

      send(message, {
        embeds: [errorEmbed],
      });

      return;
    }

    try {
      const result = await addNewSong(contentOnly, member);

      const name = result.playlistName || result.tracks[0].title;
      const isPlaylist = !!result.playlistName;

      const embed = new EmbedBuilder()
        .setDescription(
          `${isPlaylist ? 'Playlist' : 'Track'}: **${name}** added to queue.`,
        )
        .setColor(Colors.Green);

      send(message, { embeds: [embed] });
    } catch (e) {
      if (e instanceof PlayerException) {
        errorEmbed.setDescription(await resolveKey(message, e.message, { ns: 'error' }));

        send(message, { embeds: [errorEmbed] });
        return;
      }

      logger.error(e);

      errorEmbed.setDescription('An error occurred while trying to add the song to the queue.');

      send(message, {
        embeds: [errorEmbed],
      });
    }
  }
}
