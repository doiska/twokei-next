import { type ClientOptions } from "discord.js";
import { container, SapphireClient } from "@sapphire/framework";

import { SongChannelManager } from "@/structures/SongChannels";

import "../listeners/_load";
import "../commands/_load";
import "../interaction-handlers/_load";

export class TwokeiClient extends SapphireClient {
  public constructor(options: ClientOptions) {
    super(options);

    container.sc = new SongChannelManager();
  }
}
