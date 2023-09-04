import { container } from "@sapphire/framework";
import { Connectors } from "shoukaku";

import { Twokei } from "@/app/Twokei";
import { Xiao } from "@/music/controllers/Xiao";

export const xiao = new Xiao(
  {
    send: (guildId, payload) => {
      const guild = Twokei.guilds.cache.get(guildId);
      if (guild) {
        guild.shard.send(payload);
      }
    },
  },
  new Connectors.DiscordJS(Twokei),
  [],
  {
    resume: true,
    resumeByLibrary: true,
    reconnectInterval: 5000,
    reconnectTries: 10,
  },
);

container.xiao = xiao;
