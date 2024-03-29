import { ShardingManager } from "discord.js";
import { env } from "@/app/env";
import { inspect } from "node:util";
import * as process from "node:process";

const manager = new ShardingManager("./dist/init.js", {
  token: env.DISCORD_TOKEN,
  mode: "worker",
});

process.on("SIGINT", () => process.exit(1));

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

manager.spawn();
