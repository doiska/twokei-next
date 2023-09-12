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
    console.log(`Launched shard ${shard.id}`);
  });

  manager.spawn();
} else {
  import("./app/Twokei");
}
