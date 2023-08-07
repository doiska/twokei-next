import {
  ComponentType,
  Events, type Message,
} from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isGuildBasedChannel, isGuildMember, isTextChannel } from '@sapphire/discord.js-utilities';
import { container, Listener } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { noop } from '@sapphire/utilities';

import { createPlayEmbed } from '@/constants/music/create-play-embed';
import { addNewSong } from '@/music/heizou/add-new-song';
import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';
import { getReadableException } from '@/structures/exceptions/utils/get-readable-exception';
import { Embed } from '@/utils/messages';
import { sendPresetMessage } from '@/utils/utils';

import { fetchT, resolveKey } from 'twokei-i18next';

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

      if (!(await this.validateSongChannel(message))) {
        return;
      }

      await message.delete();

      const t = await fetchT(message);

      if (!hasMentions) {
        await sendPresetMessage({
          interaction: message,
          message: ErrorCodes.MISSING_MESSAGE,
          preset: 'error',
          i18n: {
            mention: container.client.user?.toString() ?? '@Twokei',
          },
        });
        return;
      }

      await sendPresetMessage({
        interaction: message,
        preset: 'loading',
      });

      const result = await addNewSong(contentOnly, member);

      const embedResult = createPlayEmbed(t, member, result);

      const replied = await send(message, embedResult);

      replied.awaitMessageComponent({
        filter: (i) => i.user.id === member.id && ['like', 'dislike'].includes(i.customId),
        componentType: ComponentType.Button,
        time: 15000,
      })
        .then(async response => {
          if (isGuildMember(response.member)) {
            await container.analytics.track({
              userId: response.member.id,
              event: response.customId === 'like' ? 'like_song' : 'dislike_song',
              source: 'Guild',
              properties: {
                track: result.tracks?.[0].short(),
              },
            });
          }

          await response.deferUpdate();
        })
        .catch(noop);
    } catch (e) {
      const readableException = await getReadableException(e, guild);
      await container.reply(message, Embed.error(readableException));
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

      await container.reply(message, Embed.error(
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
