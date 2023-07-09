import {
  Events, Message,
} from 'discord.js';
import { container, Listener } from '@sapphire/framework';
import { isGuildBasedChannel, isTextChannel } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';

import { resolveKey } from 'twokei-i18next';
import { getRandomLoadingMessage } from '@/utils/utils';
import { Embed } from '@/utils/messages';
import { PlayerException } from '@/structures/exceptions/PlayerException';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { addNewSong } from '@/music/heizou/add-new-song';
import { logger } from '@/modules/logger-transport';

@ApplyOptions<Listener.Options>({
  name: 'play-message-event',
  event: Events.MessageCreate,
})
export class PlayMessage extends Listener<Events.MessageCreate> {
  public override async run(message: Message): Promise<void | undefined> {
    const self = this.container.client.id;

    const {
      author,
      channel: typedChannel,
      member,
      guild,
    } = message;

    if (!self || author.bot || !guild || !member) {
      return;
    }

    try {
      if (!isTextChannel(typedChannel) || !isGuildBasedChannel(typedChannel)) {
        return;
      }

      const contentOnly = message.content.replace(/<@!?\d+>/g, '')
        .trim();
      const hasMentions = message.mentions.members?.has(self);

      const songChannel = await container.sc.get(guild);

      const isUsableChannel = songChannel?.channelId === typedChannel.id;

      if (!isUsableChannel) {
        if (!hasMentions) {
          return;
        }

        const response = await resolveKey(message, ErrorCodes.USE_SONG_CHANNEL, { ns: 'error', song_channel: `<#${songChannel?.channelId}>` });

        this.container.client.replyTo(message, Embed.error(response));
        return;
      }

      await message.delete();

      if (!hasMentions) {
        const response = await resolveKey(
          message,
          ErrorCodes.MISSING_MESSAGE,
          {
            joinArrays: '\n',
            ns: 'error',
            mention: this.container.client.user?.toString(),
            defaultValue: ErrorCodes.MISSING_MESSAGE,
          },
        );

        this.container.client.replyTo(message, Embed.error(response));
        return;
      }

      const locale = await this.container.client.fetchLanguage(guild);

      await this.container.client.replyTo(message, Embed.loading(getRandomLoadingMessage()));

      const result = await addNewSong(contentOnly, member);

      const name = result.playlistName || result.tracks[0].title;
      const isPlaylist = !!result.playlistName;

      this.container.client.replyTo(message, Embed.success(`${isPlaylist ? 'Playlist' : 'Track'}: **${name}** added to queue.`));
    } catch (e) {
      if (e instanceof PlayerException) {
        const translation = await resolveKey(message, e.message, { ns: 'error', defaultValue: ErrorCodes.UNKNOWN }) as string;
        this.container.client.replyTo(message, Embed.error(translation ?? ErrorCodes.UNKNOWN));
        return;
      }

      logger.error(e);
      this.container.client.replyTo(message, Embed.error(await resolveKey(message, ErrorCodes.UNKNOWN, { ns: 'error' }) as string));
    }
  }
}
