import { Client, ClientOptions, REST, Routes } from "discord.js";
import { Connectors, Shoukaku } from "shoukaku";
import { ClusterClient as ShardClient, DjsClient } from "discord-hybrid-sharding";
import { Nodes, shoukakuOptions } from "../shoukaku/options";
import glob from "fast-glob";
import { Command } from "../handlers/command/command.types";
import { parseCommandToSlashJSON } from "../handlers/command/CommandRegister";
import { Twokei } from "../app/Twokei";
import { MusicApp } from "../music/MusicApp";
import { logger } from "../utils/Logger";

export class ExtendedClient extends Client {

  public shoukaku: Shoukaku;
  public cluster: ShardClient;
  public music: MusicApp;

  public commands: Map<string, Command> = new Map();

  private _paths = ["../events/**/*.{js,ts}", "../commands/**/*.{js,ts}"];

  private _exiting = false;

  constructor(options: ClientOptions) {
    super(options);

    this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes, shoukakuOptions);

    this.music = new MusicApp(this);
    this.cluster = new ShardClient(this as unknown as DjsClient);

    this.shoukaku.on('ready', (name, info) => logger.info(`Shoukaku -> ${name} ${info}`));
    this.shoukaku.on('error', (name, info) => logger.error(`Shoukaku -> ${name} ${info}`));
    this.shoukaku.on('debug', (name, info) => logger.verbose(`Shoukaku -> ${name} ${info}`));

    ['beforeExit', 'SIGUSR1', 'SIGUSR2', 'SIGINT', 'SIGTERM'].forEach(event => process.once(event, this.exit.bind(this)));
  }

  public async start(): Promise<void> {
    await this.register();
    await this.registerLoggers();
    await this.registerSlashCommands();
    await this.login(process.env.TOKEN);
  }

  private async register(): Promise<void> {
    const files = await glob(this._paths, { cwd: __dirname, onlyFiles: true });
    files.forEach((file) => import(file));
  }

  private async registerSlashCommands() {

    if (!process.env.CLIENT_ID || typeof Twokei.token !== "string") {
      return;
    }

    const parsed = Array.from(this.commands.values()).map(parseCommandToSlashJSON);

    await new REST({ version: "10" })
      .setToken(Twokei.token)
      .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, "926643164201234533"), { body: parsed });
  }

  private async registerLoggers(): Promise<void> {
    process.on('uncaughtException', (err) => logger.error(`Uncaught Exception: ${err.stack}`));
    process.on('unhandledRejection', (reason: string, err) => logger.error(`Unhandled Rejection: ${reason}`, err));
  }

  private exit() {
    if (this._exiting)
      return;

    this._exiting = true;

    this.destroy();
    process.exit(0);
  }
}