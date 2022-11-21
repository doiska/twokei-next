import { createLogger, format, transports } from "winston";
import { Color, blue, grey, red, yellow, green, cyan } from "kleur";
import { CliConfigSetLevels } from "winston/lib/winston/config";

const colors: Record<keyof CliConfigSetLevels, Color> = {
  error: red,
  info: blue,
  warn: yellow,
  debug: grey,
  verbose: green,
}

const consoleTransportInstance = new transports.Console({
  format: format.combine(
    format.uncolorize(),
    format.printf((info) => {
      const { timestamp, level, message, stack } = info;
      const color = colors[info.level] || blue;

      return color(`(${timestamp}) [${level.toUpperCase()}]: ${stack || message}`);
    }),
  ),
});

const fileTransportInstance = new transports.File({
  filename: "logs.log",
  format: format.combine(
    format.timestamp(),
    format.printf((info) => {
      const { timestamp, level, message, stack } = info;
      return `${timestamp} [${level}]: ${stack || message}`;
    }),
  ),
});

export const logger = createLogger({
  level: "verbose",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [consoleTransportInstance, fileTransportInstance]
})