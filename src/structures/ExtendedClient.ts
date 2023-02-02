import { ClientOptions } from 'discord.js';
import { Connectors, Shoukaku } from 'shoukaku';
import { ClusterClient as ShardClient } from 'discord-hybrid-sharding';
import { Nodes, shoukakuOptions } from '../shoukaku/options';
import { Twokei } from '../app/Twokei';
import { logger } from '../modules/logger-transport';
import { Xiao } from '../music/controllers/Xiao';

import { TwokeiClient } from 'twokei-framework';
import { DataSource } from 'typeorm';
import { GuildEntity } from '../entities/GuildEntity';
import { SongChannelEntity } from '../entities/SongChannelEntity';
import { UserEntity } from '../entities/UserEntity';
import { SongEntity } from '../entities/SongEntity';

import { init as init18n } from '../translation/i18n';
import * as process from 'process';

declare module 'discord.js' {
  interface Client {
    shoukaku: Shoukaku;
    cluster: ShardClient<TwokeiClient>;
    xiao: Xiao;
  }
}

export class ExtendedClient extends TwokeiClient {

  public shoukaku: Shoukaku;
  public cluster: ShardClient<this>;
  public xiao: Xiao;

  public dataSource: DataSource;

  private _exiting = false;

  constructor(options: ClientOptions) {
    super({
      ...options,
      currentWorkingDirectory: __dirname,
      commandsPath: `../commands/**/*.{ts,js}`,
      eventsPath: `../events/**/*.{ts,js}`,
      autoload: true

    });

    this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes, shoukakuOptions);

    this.xiao = new Xiao({
      send: (guildId, payload) => {
        const guild = Twokei.guilds.cache.get(guildId);
        if (guild) {
          guild.shard.send(payload);
        }
      },
      defaultSearchEngine: 'youtube'
    }, new Connectors.DiscordJS(this), Nodes, shoukakuOptions);

    this.cluster = new ShardClient(this);

    this.dataSource = new DataSource({
      type: 'postgres',
      synchronize: true,
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      schema: process.env.POSTGRES_SCHEMA,
      entities: [
        UserEntity,
        GuildEntity,
        SongEntity,
        SongChannelEntity
      ]
    });

    this.on('error', (error) => {
      logger.error(error)
    });

    this.on('warn', (warning) => {
      logger.warn(warning)
    });

    this.on('debug', (debug) => {
      logger.debug('Client debug', debug)
    });

    //TODO: ['beforeExit', 'SIGUSR1', 'SIGUSR2', 'SIGINT', 'SIGTERM'].forEach(event => process.on(event,
    // this.exit.bind(this)));
  }

  public async start(): Promise<void> {
    this.dataSource.initialize()
      .then(async () => {
        logger.info('Database connected!');
        await init18n()
          .then(() => logger.info('i18n initialized!'))
          .catch((error) => logger.error('i18n failed to initialize', error));

        await this.login(process.env.TOKEN);
      })
      .catch((error) => {
        logger.error('Database failed to connect', error)
      });
  }

  private exit() {
    if (this._exiting) {
      return;
    }

    this._exiting = true;

    this.destroy();
    process.exit(0);
  }
}