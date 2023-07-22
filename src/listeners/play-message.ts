import {
  ComponentType,
  Events, type Message,
} from 'discord.js';
import { container, Listener } from '@sapphire/framework';
import { isGuildBasedChannel, isTextChannel } from '@sapphire/discord.js-utilities';
import { ApplyOptions } from '@sapphire/decorators';

import { fetchT, resolveKey } from 'twokei-i18next';
import { getRandomLoadingMessage } from '@/utils/utils';
import { Embed } from '@/utils/messages';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { addNewSong } from '@/music/heizou/add-new-song';
import { createPlayEmbed } from '@/constants/music/create-play-embed';
import {noop} from "@sapphire/utilities";
import {send} from "@sapphire/plugin-editable-commands";

@ApplyOptions<Listener.Options>({
  name: 'play-message-event',
  event: Events.MessageCreate,
})
export class PlayMessage extends Listener<typeof Events.MessageCreate> {
  public override async run (message: Message) {
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

      const hasMentions = message.mentions.members?.has(self);
      const contentOnly = message.content
        .replace(/<@!?\d+>/g, '')
        .trim();

      console.log(hasMentions, contentOnly);

      if (!(await this.validateSongChannel(message))) {
        return;
      }

      await message.delete();

      const t = await fetchT(message);

      if (!hasMentions) {
        const response = t(ErrorCodes.MISSING_MESSAGE,
          {
            joinArrays: '\n',
            ns: 'error',
            mention: this.container.client.user?.toString(),
            defaultValue: ErrorCodes.MISSING_MESSAGE,
          });

        void container.client.replyTo(message, Embed.error(response));
        return;
      }

      await container.client.replyTo(message, Embed.loading(getRandomLoadingMessage()));

      const result = await addNewSong(contentOnly, member);

      const embedResult = createPlayEmbed(t, member, result);

      const replied = await send(message, embedResult);

      replied.awaitMessageComponent({
        filter: (i) => i.user.id === member.id && ['like', 'dislike'].includes(i.customId),
        componentType: ComponentType.Button,
        time: 15000,
      })
          .then(async response => {
            await container.analytics.track({
              userId: member.user.id,
              event: response.customId === 'like' ? 'like_song' : 'dislike_song',
              source: 'Guild',
              properties: {
                track: result.tracks?.[0].short()
              }
            });

            response.deferUpdate();
          })
          .catch(noop);

    } catch (e) {
      const readableException = await getReadableException(e, guild);
      await container.client.replyTo(message, Embed.error(readableException));
    }
  }

  private async validateSongChannel (message: Message) {
    const self = this.container.client.id;
    const { channel: typedChannel, guild } = message;

    if (!self || !guild || !typedChannel) {
      return false;
    }

    const hasMentions = message.mentions.members?.has(self);
    const songChannel = await container.sc.get(guild);
    const isUsableChannel = songChannel?.channelId === typedChannel.id;

    if (!isUsableChannel) {
      if (!hasMentions) {
        return false;
      }

      await container.client.replyTo(message, Embed.error(
          await resolveKey(message,
              ErrorCodes.USE_SONG_CHANNEL,
              {
                  ns: 'error',
                  song_channel: `<#${songChannel?.channelId ?? ''}>`,
              }),
      ));
    }

    return true;
  }
}
