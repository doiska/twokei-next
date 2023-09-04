import { kil } from "@/db/Kil";
import { logs } from "@/db/schemas/logs";

import { capitalizeFirst } from "@/lib/message-handler/helper";

import Transport from "winston-transport";

export class DiscordTransport extends Transport {
  private readonly ignoreLevels = ["debug", "info", "silly"];

  async log(info: any, callback: () => void) {
    if (this.silent) {
      callback();
      return;
    }

    const { defaultPrefix = "Unknown", message, level } = info;

    if (this.ignoreLevels.includes(level)) {
      callback();
      return;
    }

    const exception = info?.error ?? info?.stack;

    // await kil.insert(logs).values({
    //   message,
    //   source: capitalizeFirst(defaultPrefix) ?? "Unknown",
    //   env: process.env.NODE_ENV === "production" ? "Production" : "Development",
    //   severity: capitalizeFirst(level),
    //   trace: exception ? JSON.stringify(exception) : null,
    // });

    callback();
  }
}
