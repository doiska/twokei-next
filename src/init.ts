import "dotenv/config";
import { ShardingManager } from "discord.js";
import { env } from "@/app/env";
import { inspect } from "node:util";

const manager = new ShardingManager("./dist/app/Twokei.js", {
  token: env.DISCORD_TOKEN,
  mode: "process",
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", inspect(error, true, 1));
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

manager.on("shardCreate", (shard) => {
  shard.on("death", () => console.log(`Shard ${shard.id} died`));
  shard.on("disconnect", () => console.log(`Shard ${shard.id} disconnected`));
  shard.on("ready", () => console.log(`Shard ${shard.id} ready`));
  shard.on("error", (error) => console.error(error));
});

manager.spawn({
  amount: 1,
});
