import "dotenv/config";
import { ShardingManager } from "discord.js";
import { env } from "@/app/env";

if (env.SHARDING_MANAGER_ENABLED) {
  const manager = new ShardingManager("./dist/app/Twokei.js", {
    token: env.DISCORD_TOKEN,
  });

  process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
  });

  manager.on("shardCreate", (shard) => {
    shard.on("death", () => console.log(`Shard ${shard.id} died`));
    shard.on("disconnect", () => console.log(`Shard ${shard.id} disconnected`));
    shard.on("ready", () => console.log(`Shard ${shard.id} ready`));
    shard.on("message", () => console.log(`Shard ${shard.id} messaged`));
  });

  manager.spawn();
} else {
  import("./app/Twokei");
}
