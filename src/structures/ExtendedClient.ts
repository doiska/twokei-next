import { ClientOptions } from 'discord.js';
import { Connectors } from 'shoukaku';
import { Nodes, shoukakuOptions } from '../music/options';
import { Twokei } from '../app/Twokei';
import { logger } from '../modules/logger-transport';
import { Xiao } from '../music/controllers/Xiao';

import { TwokeiClient } from 'twokei-framework';

import process from 'node:process';

import { init as initI18n } from '../translation/i18n';

declare module 'discord.js' {
  interface Client {
    xiao: Xiao;
  }
}

export class ExtendedClient extends TwokeiClient {

  public xiao: Xiao;

  private _exiting = false;

  constructor(options: ClientOptions) {

    super({
      ...options,
      currentWorkingDirectory: __dirname,
      commandsPath: `../listeners/commands/**/*.{ts,js}`,
      eventsPath: `../listeners/events/**/*.{ts,js}`,
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
      console.log(error)
    });

    this.on('warn', (warning) => {
      logger.warn(warning);
      console.log(warning)
    });

    ['beforeExit',
      'SIGUSR1',
      'SIGUSR2',
      'SIGINT',
      'SIGTERM'
    ].map((event) => process.on(event, () => this.exit()));
  }

  public async start(): Promise<void> {

    await Promise.all([
      this.login(process.env.TOKEN),
      initI18n()
    ])
      .then(() => {
        logger.info('All modules initialized');
        logger.info('Logged in.');
      })
      .catch((error) => {
        logger.error(error);
        logger.error('Failed to initialize modules');
        this.exit();
      });
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

  public async getCommands() {
    if (!this.application) {
      throw new Error('Application not found');
    }

    return await this.application.commands.fetch();
  }
}