import "@sapphire/plugin-i18next/register";
import "@/app/server/hooks/HttpServerHook";

import { type ClientOptions } from "discord.js";
import { container, SapphireClient } from "@sapphire/framework";

import { SongProfileManager } from "@/features/song-profile/SongProfileManager";
import { Analytics } from "@/structures/Analytics";
import { SongChannelManager } from "@/structures/SongChannels";
import { Xiao } from "@/music/controllers/Xiao";
import { Connectors } from "shoukaku";
import { env } from "@/app/env";

export class TwokeiClient extends SapphireClient {
  public xiao: Xiao;

  public constructor(options: ClientOptions) {
    super(options);

    this.xiao = new Xiao(
      this,
      {
        send: (guildId, payload) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) {
            guild.shard.send(payload);
          }
        },
      },
      new Connectors.DiscordJS(this),
      [],
      {
        resume: true,
        resumeByLibrary: true,
        reconnectInterval: 5000,
        reconnectTries: 10,
        userAgent: `Twokei (${env.NODE_ENV})`,
      },
    );

    container.sc = new SongChannelManager();
    container.profiles = new SongProfileManager();
    container.analytics = new Analytics();
    container.xiao = this.xiao;
  }

  public getContainer() {
    return container;
  }
}
