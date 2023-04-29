import { Guild } from 'discord.js';
import { Locale, VALID_LOCALES } from '../translation/i18n';
import { getGuildSongEntity } from './get-guild-song-channel';
import { GuildEntity } from '../entities/GuildEntity';
import { Twokei } from '../app/Twokei';
import { isTextChannel } from '@sapphire/discord.js-utilities';
import { createDefaultButtons, createDefaultSongEmbed } from '../music/embed/create-song-embed';

export async function setGuildLocale(guild: Guild, locale: Locale) {
  if (!VALID_LOCALES.includes(locale)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  const repository = Twokei.dataSource.getRepository(GuildEntity);

  const entity = await repository.findOne({
    where: {
      id: guild.id
    }
  });

  if (!entity) {
    throw new Error(`Invalid guild: ${guild.id}`);
  }

  await repository.update({
    id: guild.id
  }, {
    locale
  });


  getGuildSongEntity(guild).then(async entity => {
        const channel = await guild.channels.fetch(entity.channel);

        if (!channel || !isTextChannel(channel)) {
          return;
        }

        const message = await channel.messages.fetch(entity.message);

        if (!message) {
          return;
        }

        await message.edit({
          embeds: [await createDefaultSongEmbed(locale)],
          components: createDefaultButtons(locale)
        });
      }
  );
}