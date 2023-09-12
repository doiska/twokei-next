import "@sapphire/plugin-i18next/register";
import "@/app/server/hooks/HttpServerHook";

import {
  type ClientOptions,
} from "discord.js";
import { container, SapphireClient } from "@sapphire/framework";

import { SongProfileManager } from "@/features/song-profile/SongProfileManager";
import { Analytics } from "@/structures/Analytics";
import { SongChannelManager } from "@/structures/SongChannels";

export class TwokeiClient extends SapphireClient {
  public constructor(options: ClientOptions) {
    super(options);

    container.sc = new SongChannelManager();
    container.profiles = new SongProfileManager();
    container.analytics = new Analytics();
  }
}