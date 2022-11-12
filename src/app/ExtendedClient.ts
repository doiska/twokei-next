import { Client, ClientOptions, REST, Routes } from "discord.js";
import { Connectors, Shoukaku } from "shoukaku";
import { ClusterClient as ShardClient, DjsClient } from "discord-hybrid-sharding";
import { Nodes } from "../shoukaku/options";
import glob from "fast-glob";
import { green, red, yellow } from "kleur";
import { Command } from "../handlers/command/command.types";
import { parseCommandToSlashJSON } from "../handlers/command/CommandRegister";
import { Twokei } from "./Twokei";

export class ExtendedClient extends Client {

  public shoukaku: Shoukaku;
  public cluster: ShardClient;

  public commands: Map<string, Command> = new Map();

  private _paths = ["../events/**/*.{js,ts}", "../commands/**/*.{js,ts}"];

  constructor(options: ClientOptions) {
    super(options);
    this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes, {});
    this.cluster = new ShardClient(this as unknown as DjsClient);
  }

  public async start(): Promise<void> {
    await this.register();
    await this.registerLoggers();
    await this.registerSlashCommands();
    await this.login(process.env.TOKEN);
  }

  private async register(): Promise<void> {
    console.log(yellow("Registering events..."));

    const files = await glob(this._paths, { cwd: __dirname, onlyFiles: true });
    files.map((file) => import(file));

    console.log(green("Registering events... Done!"));
  }


  private async registerSlashCommands() {

    if (!process.env.CLIENT_ID || typeof Twokei.token !== "string")
      return;

    const parsed = Array.from(this.commands.values()).map(parseCommandToSlashJSON);

    await new REST({ version: "10" })
      .setToken(Twokei.token)
      .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, "926643164201234533"), { body: parsed });
  }


  private async registerLoggers(): Promise<void> {
    process.on('uncaughtException', (err) => console.error(red(`Uncaught Exception: ${err.stack}`)));
    process.on('unhandledRejection', (reason: string, err) => console.error(red(`Unhandled Rejection: ${reason}`), err));
  }
}