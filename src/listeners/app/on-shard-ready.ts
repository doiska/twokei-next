import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { Events } from "discord.js";
import { logger } from "@/modules/logger-transport";

@ApplyOptions<Listener.Options>({
  name: "shardReady",
  once: true,
  event: Events.ShardReady,
})
export class OnShardReady extends Listener<typeof Events.ShardReady> {
  public override async run(id: number) {
    if (id === 0) {
      logger.info(`Main shard is ready!`);
      await container.server.connect();
    }
  }
}
