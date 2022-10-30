import { Client, ClientOptions } from "discord.js";
import { Connectors, Shoukaku } from "shoukaku";
import { ClusterClient as ShardClient, DjsClient } from "discord-hybrid-sharding";
import { Nodes } from "../shoukaku/options";

export class ExtendedClient extends Client {

  public shoukaku: Shoukaku;
  public cluster: ShardClient;

  constructor(options: ClientOptions) {
    super(options);
    this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes, {});
    this.cluster = new ShardClient(this as unknown as DjsClient);
  }
}