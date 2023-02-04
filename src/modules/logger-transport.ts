import { createLogger, format, transports } from "winston";
import { Color, blue, grey, red, yellow, green, cyan } from "kleur";
import { CliConfigSetLevels } from "winston/lib/winston/config";

const colors: Record<keyof CliConfigSetLevels, Color> = {
  error: red,
  info: blue,
  warn: yellow,
  debug: cyan,
  verbose: green,
}

const consoleTransportInstance = new transports.Console({
  format: format.combine(
    format.printf((info) => {
      const { timestamp, level, message, stack, ...rest } = info;
      const color = colors[info.level] || blue;

      const content = Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : "";

      return color(`(${timestamp}) [${level.toUpperCase()}]: ${stack || message} ${content}`);
    }),
  ),
});

const fileTransportInstance = new transports.File({
  filename: "logs.log",
  format: format.combine(
    format.timestamp(),
    format.printf((info) => {
      const { timestamp, level, message, stack, ...rest } = info;
      return `${timestamp} [${level}]: ${stack || message} (${JSON.stringify(rest, null, 2)})`;
    }),
  ),
});

export const logger = createLogger({
  level: "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [consoleTransportInstance, fileTransportInstance]
})