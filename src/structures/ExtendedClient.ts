import { ClientOptions } from 'discord.js';
import { Connectors } from 'shoukaku';
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

import process from 'node:process';

import { init as initI18n } from '../translation/i18n';

declare module 'discord.js' {
  interface Client {
    xiao: Xiao;
  }
}

export class ExtendedClient extends TwokeiClient {

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

    this.xiao = new Xiao({
      send: (guildId, payload) => {
        const guild = Twokei.guilds.cache.get(guildId);
        if (guild) {
          guild.shard.send(payload);
        }
      },
      defaultSearchEngine: 'youtube'
    }, new Connectors.DiscordJS(this), Nodes, shoukakuOptions);

    this.dataSource = new DataSource({
      type: 'postgres',
      synchronize: true,
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT),
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      schema: process.env.PGSCHEMA,
      entities: [
        UserEntity,
        GuildEntity,
        SongEntity,
        SongChannelEntity
      ]
    });

    this.on('error', (error) => {
      logger.error(error);
    });

    this.on('warn', (warning) => {
      logger.warn(warning);
    });

    ['beforeExit',
      'SIGUSR1',
      'SIGUSR2',
      'SIGINT',
      'SIGTERM',
    ].map((event) => process.on(event, () => this.exit()));
  }

  public async start(): Promise<void> {
    this.dataSource.initialize()
      .then(async () => {
        logger.info('Database connected!');
        await initI18n()
          .then(() => logger.info('i18n initialized!'))
          .catch((error) => logger.error('i18n failed to initialize', error));

        await this.login(process.env.TOKEN);
      })
      .catch((error) => logger.error('Database failed to connect', error));
  }

  private exit() {
    if (this._exiting) {
      return;
    }

    console.log('Exiting...')

    this._exiting = true;

    this.destroy();
    process.exit(0);
  }
}