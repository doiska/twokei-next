import process from 'node:process';

import {ApplicationCommand, ClientOptions, Collection} from 'discord.js';
import {TwokeiClient} from 'twokei-framework';

import {logger} from '@/modules/logger-transport';

import {init as initI18n} from '../i18n/i18n';

export class ExtendedClient extends TwokeiClient {

  private loadedCommands: Collection<string, ApplicationCommand> = new Collection();
  private _exiting = false;

  constructor(options: ClientOptions) {

    super({
      ...options,
      currentWorkingDirectory: process.cwd() + '/src/',
      commandsPath: '../listeners/commands/**/*.{ts,js}',
      eventsPath: '../listeners/events/**/*.{ts,js}',
      autoload: true
    });

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

  public getCommands() {
    return this.loadedCommands;
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
}