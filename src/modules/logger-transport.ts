import {
  blue, type Color, cyan, green, red, reset, yellow,
} from 'kleur';
import { createLogger, format, transports } from 'winston';
import { type CliConfigSetLevels } from 'winston/lib/winston/config';
//
const colors: Record<keyof CliConfigSetLevels, Color> = {
  error: red,
  info: blue,
  warn: yellow,
  debug: cyan,
  verbose: green,
};

const consoleTransportInstance = new transports.Console({
  format: format.combine(
    format.printf((info) => {
      const {
        timestamp,
        level: uncoloredLevel,
        message,
        stack,
        defaultPrefix = 'CORE',
        ...rest
      } = info as Record<string, string>;

      const content = stack || reset(message);

      const color = colors[info.level] ?? blue;

      const prefix = color(`${timestamp} [${defaultPrefix}] - [${uncoloredLevel.toUpperCase()}]:`);

      const trace = stack ? `\n${stack.replace(/\n/g, `\n${prefix}`)}` : '';

      const stringify = JSON.stringify(rest, null, 2);

      const stringifyWithColors = stringify.split('\n')
        .map((line) => `${prefix} ${yellow(line)}`)
        .join('\n');

      const details = Object.keys(rest).length > 0 ? `\n${stringifyWithColors}` : '';

      return `${prefix} ${content} ${details} ${trace}`;
    }),
  ),
});

const defaultOptions = {
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [consoleTransportInstance],
};

export const logger = createLogger({ ...defaultOptions });

export const playerLogger = createLogger({
  ...defaultOptions,
  defaultMeta: {
    defaultPrefix: 'PLAYER',
  },
});

export const queryLogger = createLogger({
  ...defaultOptions,
  defaultMeta: {
    defaultPrefix: 'QUERY',
  },
});
