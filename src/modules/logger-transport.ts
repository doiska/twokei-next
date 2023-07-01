import {
  blue, Color, cyan, green, red, reset, yellow,
} from 'kleur';
import { createLogger, format, transports } from 'winston';
import { CliConfigSetLevels } from 'winston/lib/winston/config';
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
        pid: _,
        message,
        stack,
        ...rest
      } = info;

      const content = stack ? '' : reset(message);

      const color = colors[info.level] ?? blue;
      const prefix = `${color(timestamp)} - ${color(
        uncoloredLevel.toUpperCase(),
      )} - `;
      const trace = stack ? `\n${stack.replace(/\n/g, `\n${prefix}`)}` : '';

      const details = Object.keys(rest).length
        ? `\n${JSON.stringify(rest, null, 2)}`
        : '';

      return `${prefix} ${content} ${details} ${trace}`;
    }),
  ),
});

export const logger = createLogger({
  level: 'debug',
  defaultMeta: {
    pid: process.pid,
  },
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [consoleTransportInstance],
});
