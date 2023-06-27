import {Message, Snowflake} from 'discord.js';

import {getGuidLocale} from '../../modules/guild-locale';
import {Maybe} from '../../utils/type-guards';
import {Venti} from '../controllers/Venti';
import {GuildEmbed} from './guild-embed';

export class GuildEmbedManager {

  private guilds: Map<Snowflake, GuildEmbed> = new Map();

  public async create(venti: Venti, guildId: Snowflake, message: Message): Promise<GuildEmbed> {
    const locale = await getGuidLocale(guildId);

    const guildEmbed = new GuildEmbed(venti, guildId, message, locale);
    this.guilds.set(guildId, guildEmbed);
    return guildEmbed;
  }

  public get(guildId: Snowflake): Maybe<GuildEmbed> {
    return this.guilds.get(guildId);
  }

  public destroy(guildId: Snowflake) {
    this.get(guildId)?.reset().refresh();
    this.guilds.delete(guildId);
  }
}