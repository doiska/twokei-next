// eslint-disable-next-line import/no-extraneous-dependencies
import concurrently from 'concurrently';

concurrently([
  {
    name: 'SWC',
    command: 'swc src -d dist --watch',
    prefixColor: 'blue',
    env: {
      NODE_ENV: 'development',
      SWCRC: 'true',
    },
    cwd: process.cwd(),
  },
  {
    name: 'Node',
    command: 'nodemon --watch src --ext ts --exec node dist/single-shard.js',
    prefixColor: 'green',
    env: {
      NODE_ENV: 'development',
    },
  },
], {
  killOthers: ['failure', 'success'],
  restartTries: 3,
  prefix: 'name',
  timestampFormat: 'HH:mm:ss',
  timings: true,
});
