import {
  createLogger as createWinstonLogger,
  format,
  transports,
} from "winston";
import { red, blue, green, reset, yellow } from "ansis";
import { env } from "@/app/env";

const colors = {
  error: red,
  info: blue,
  warn: yellow,
  debug: green,
  verbose: green,
} as Record<string, (str: string) => string>;

function getColorByLevel(level: string): (str: string) => string {
  return colors[level] ?? blue;
}

const consoleTransportInstance = new transports.Console({
  format: format.combine(
    format.printf((info) => {
      const {
        timestamp,
        level: uncoloredLevel = "info",
        message = "",
        stack,
        module: group = "CORE",
        ...rest
      } = info as Record<string, string>;

      const content = stack || reset(message);

      const color = getColorByLevel(uncoloredLevel);

      const prefix = color(
        `${timestamp} [${uncoloredLevel.toUpperCase()}] [${group.toUpperCase()}]:`,
      );

      const trace = stack ? `\n${stack.replace(/\n/g, `\n${prefix}`)}` : "";

      const stringify = JSON.stringify(rest, null, 2);

      const stringifyWithColors = stringify
        .split("\n")
        .map((line) => `${prefix} ${yellow(line)}`)
        .join("\n");

      const details =
        Object.keys(rest).length > 0 ? `\n${stringifyWithColors}` : "";

      return `${prefix} ${content} ${details} ${trace}`;
    }),
  ),
});

const defaultLoggerOptions = {
  level: env.LOG_LEVEL,
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [consoleTransportInstance],
};

export const logger = createWinstonLogger(defaultLoggerOptions);

export const playerLogger = logger.child({
  module: "PLAYER",
});

export const queryLogger = logger.child({
  module: "QUERY",
});
