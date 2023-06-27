// import { Color, cyan, green, red, yellow} from 'kleur';
import {createLogger, format, transports} from 'winston';
import {CliConfigSetLevels} from 'winston/lib/winston/config';
//
// const colors: Record<keyof CliConfigSetLevels, Color> = {
//   error: red,
//   info: blue,
//   warn: yellow,
//   debug: cyan,
//   verbose: green,
// };

const consoleTransportInstance = new transports.Console({
  format: format.combine(
    format.printf((info) => {
      const {timestamp, level, message, stack, pid, ...rest} = info;
      // const color = colors[info.level] ?? blue;
      const content = message || stack || 'Profiler';

      const details = Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : '';

      return `[${pid}] (${timestamp}) [${level.toUpperCase()}]: ${content} ${details}`;
    }),
  ),
});


export const logger = createLogger({
  level: 'debug',
  defaultMeta: {
    pid: process.pid,
  },
  format: format.combine(
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.errors({stack: true}),
    format.json(),
  ),
  transports: [consoleTransportInstance]
});