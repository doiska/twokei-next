import { ClientOptions } from 'discord.js';
import { Connectors, Shoukaku } from 'shoukaku';
import { ClusterClient as ShardClient, DjsClient } from 'discord-hybrid-sharding';
import { Nodes, shoukakuOptions } from '../shoukaku/options';
import { Twokei } from '../app/Twokei';
import { logger } from '../utils/Logger';
import { Xiao } from '../xiao/Xiao';

import { TwokeiClient } from 'twokei-framework';
import { DataSource } from 'typeorm';
import { GuildEntity } from '../entities/GuildEntity';
import { SongChannelEntity } from '../entities/SongChannelEntity';
import { UserEntity } from '../entities/UserEntity';
import { SongEntity } from '../entities/SongEntity';

declare module 'discord.js' {
  interface Client {
    shoukaku: Shoukaku;
    cluster: ShardClient;
    xiao: Xiao;
  }
}

export class ExtendedClient extends TwokeiClient {

  public shoukaku: Shoukaku;
  public cluster: ShardClient;
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
        if (guild) guild.shard.send(payload);
      },
      defaultSearchEngine: 'youtube'
    }, new Connectors.DiscordJS(this), Nodes, shoukakuOptions);

    this.cluster = new ShardClient(this as unknown as DjsClient);

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
        SongChannelEntity,
      ]
    });

    ['beforeExit', 'SIGUSR1', 'SIGUSR2', 'SIGINT', 'SIGTERM'].forEach(event => process.once(event, this.exit.bind(this)));
  }

  public async start(): Promise<void> {
    this.dataSource.initialize()
      .then(async () => {
        logger.info('Database connected!');
        await this.registerLoggers();
        await this.login(process.env.TOKEN);
      })
      .catch((error) => logger.error('Database failed to connect', error));
  }

  private async registerLoggers(): Promise<void> {
    process.on('uncaughtException', (err) => logger.error(`Uncaught Exception: ${err.stack}`));
    process.on('unhandledRejection', (reason: string, err) => logger.error(`Unhandled Rejection: ${reason}`, err));
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