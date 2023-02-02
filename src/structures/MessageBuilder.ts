import type { APIEmbed, MessageCreateOptions } from 'discord.js';
import { EmbedBuilder, Message, NewsChannel, TextChannel } from 'discord.js';
import { assertEmbedSize } from '../utils/embed-utils';
import * as assert from 'assert';

export type MessageBuilderFileResolvable = NonNullable<MessageCreateOptions['files']>[number];
export type MessageBuilderResolvable = Omit<MessageCreateOptions, 'embed' | 'disableMentions' | 'reply'> & {
  embeds?: MessageCreateOptions['embeds'];
  expiration?: number;
};

/**
 * A message builder class, it implements the {@link MessageCreateOptions} interface.
 */
export class MessageBuilder implements MessageCreateOptions {
  /**
   * Whether the message should be spoken aloud.
   * @default false
   */
  public tts?: MessageCreateOptions['tts'];

  /**
   * The nonce for the message.
   * @default ''
   */
  public nonce?: MessageCreateOptions['nonce'];

  /**
   * The content for the message. If set to undefined and the builder is used to edit, the content will not be
   * replaced.
   */
  public content?: MessageCreateOptions['content'];

  /**
   * The embeds for the message. If set to undefined and the builder is used to edit, the embed will not be replaced.
   * @remark There is a maximum of 10 embeds in 1 message
   */
  public embeds: MessageCreateOptions['embeds'];

  /**
   * Which mentions should be parsed from the message content.
   */
  public allowedMentions?: MessageCreateOptions['allowedMentions'];

  /**
   * Files to send with the message. This should not be set when editing a message, as Discord does not support
   * editing file attachments.
   */
  public files?: MessageCreateOptions['files'];

  /**
   * Expiration time for the message in milliseconds.
   * @param options
   */
  public expiration?: number;


  /**
   * The default values for all MessageBuilder instances.
   */
  public static defaults: MessageBuilderResolvable = {
    expiration: 10000
  };


  public constructor(options?: MessageBuilderResolvable) {
    this.tts = options?.tts ?? MessageBuilder.defaults.tts;
    this.nonce = options?.nonce ?? MessageBuilder.defaults.nonce;
    this.content = options?.content ?? MessageBuilder.defaults.content;
    this.embeds = options?.embeds ?? MessageBuilder.defaults.embeds;
    this.allowedMentions = options?.allowedMentions ?? MessageBuilder.defaults.allowedMentions;
    this.files = options?.files ?? MessageBuilder.defaults.files;
    this.expiration = options?.expiration ?? MessageBuilder.defaults.expiration;
  }

  /**
   * Sets the value for the {@link MessageBuilder.tts} field.
   * @param tts Whether or not the message should be spoken aloud.
   */
  public setTTS(tts?: boolean): this {
    this.tts = tts;
    return this;
  }

  /**
   * Sets the value for the {@link MessageBuilder.nonce} field.
   * @param nonce The nonce for the message.
   */
  public setNonce(nonce?: string): this {
    this.nonce = nonce;
    return this;
  }

  /**
   * Sets the value for the {@link MessageBuilder.content} field.
   * @param content The content for the message. If set to undefined and the builder is used to edit, the content will
   * not be replaced.
   */
  public setContent(content?: string): this {
    this.content = content;
    return this;
  }

  /**
   * Sets the value for the {@link MessageBuilder.embed} field.
   * @param embeds The embeds for the message. If set to undefined and the builder is used to edit, the embed will not be
   * replaced. There is a maximum of 10 embeds per message
   * @remark When providing more than 10 embeds, the array will automatically be sliced down to the first 10.
   */
  public setEmbeds(embeds: EmbedBuilder | MessageCreateOptions['embeds']): this {
    // Ensure no more than 10 embeds are ever se

    if(!embeds) {
      this.embeds = [];
      return this;
    }

    embeds = Array.isArray(embeds) ? embeds : [embeds];


    if (embeds && embeds.length > 10) {
      embeds = embeds.slice(0, 10);
    }

    this.embeds = embeds.map(embed => embed instanceof EmbedBuilder ? embed.data : embed);
    return this;
  }

  /**
   * Sets the value for the {@link MessageBuilder.allowedMentions} field.
   * @param allowedMentions Which mentions should be parsed from the message content.
   */
  public setAllowedMentions(allowedMentions?: MessageCreateOptions['allowedMentions']): this {
    this.allowedMentions = allowedMentions;
    return this;
  }

  /**
   * Adds a new value for the {@link MessageBuilder.files} field array.
   * @param file The file to add to the {@link MessageBuilder.files} field array.
   */
  public addFile(file: MessageBuilderFileResolvable): this {
    this.files = this.files?.concat(file) ?? [file];
    return this;
  }

  /**
   * Sets a single value for the {@link MessageBuilder.files} field array.
   * @param file The file to send with the message. This should not be set when editing a message, as Discord does not
   * support editing file attachments.
   */
  public setFile(file: MessageBuilderFileResolvable): this {
    this.files = [file];
    return this;
  }

  /**
   * Sets the value for the {@link MessageBuilder.files} field.
   * @param files The files to send with the message. This should not be set when editing a message, as Discord does
   * not support editing file attachments.
   */
  public setFiles(files?: MessageBuilderFileResolvable[]): this {
    this.files = files;
    return this;
  }

  public setExpiration(expiration?: number): this {
    if(!expiration || expiration < 0) {
      this.expiration = undefined;
    }

    this.expiration = expiration;
    return this;
  }

  public async send(channel: TextChannel | NewsChannel): Promise<Message> {
    if(this.embeds) {
      this.embeds = this.embeds.map(embed => assertEmbedSize(embed as APIEmbed));
    }

    const message = await channel.send(this);

    if (this.expiration) {
      setTimeout(() => message.delete().catch(() => {}), this.expiration);
    }

    return message;
  }
}