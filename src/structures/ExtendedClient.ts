import { ApplicationCommand, ClientOptions, Collection } from 'discord.js';

import process from 'node:process';
import { Connectors } from 'shoukaku';
import { TwokeiClient } from 'twokei-framework';

import { Twokei } from '../app/Twokei';
import { init as initI18n } from '../i18n/i18n';
import { logger } from '../modules/logger-transport';
import { Xiao } from '../music/controllers/Xiao';
import { Nodes, shoukakuOptions } from '../music/options';

declare module 'discord.js' {
  interface Client {
    xiao: Xiao;
  }
}

export class ExtendedClient extends TwokeiClient {

  public xiao: Xiao;

  private _exiting = false;

  private loadedCommands: Collection<string, ApplicationCommand> = new Collection();

  constructor(options: ClientOptions) {

    super({
      ...options,
      currentWorkingDirectory: __dirname,
      commandsPath: '../listeners/commands/**/*.{ts,js}',
      eventsPath: '../listeners/events/**/*.{ts,js}',
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

    this.on('error', (error) => {
      logger.error(error);
      console.log(error);
    });

    this.on('warn', (warning) => {
      logger.warn(warning);
      console.log(warning);
    });

    ['beforeExit',
      'SIGUSR1',
      'SIGUSR2',
      'SIGINT',
      'SIGTERM'
    ].map((event) => process.on(event, () => this.exit()));
  }

  public async start(): Promise<void> {
    try {
      await this.login(process.env.TOKEN);

      this.loadedCommands = await this.application?.commands.fetch() ?? new Collection();

      await initI18n();

      logger.info('All modules initialized');
      logger.info(`Logged in as ${this.user?.tag}`);
      logger.info(`Loaded commands: ${this.loadedCommands.size}`);
    } catch (e) {
      logger.error(e);
      logger.error('Failed to initialize modules');
      this.exit();
    }
  }

  private exit() {
    if (this._exiting) {
      return;
    }

    console.log('Exiting...');

    this._exiting = true;

    this.destroy();
    process.exit(0);
  }

  public getCommands() {
    return this.loadedCommands;
  }
}