import {Twokei} from '@/app/Twokei';
import {logger} from '@/modules/logger-transport';
import {Xiao} from '@/music/controllers/Xiao';
import {Nodes, shoukakuOptions} from '@/music/options';
import {Connectors} from 'shoukaku';

const sourcesUrl = [
  'https://raw.githubusercontent.com/DarrenOfficial/lavalink-list/master/docs/NoSSL/lavalink-without-ssl.md',
  'https://raw.githubusercontent.com/DarrenOfficial/lavalink-list/master/docs/SSL/lavalink-with-ssl.md'
];

async function getWebNodes() {
  try {
    const sources = await Promise.all(sourcesUrl.map(async source => fetch(source).then(res => res.text())));

    return sources.map(source => {
      const regex = /```bash([\s\S]*?)```/g;
      const matches = source.match(regex) || [];

      return matches.map(match => {
        const filtered = match.slice(7, -3).trim().split('\n');

        const parsed = filtered.reduce((acc, curr) => {
          const [key, value] = curr.split(':').map(str => str.replace(/"/g, '').trim());

          if (value === 'true' || value === 'false') {
            acc[key.toLowerCase()] = value === 'true';
          } else {
            acc[key.toLowerCase()] = value;
          }

          return acc;
        }, {} as Record<string, string | boolean>);

        return {
          name: parsed.host,
          url: parsed.host,
          password: parsed.password,
          secure: !!parsed.secure,
        };
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

console.log('Fetching web nodes...');
console.log(process.env.SWCRC);

export const xiao = new Xiao({
  send: (guildId, payload) => {
    const guild = Twokei.guilds.cache.get(guildId);
    if (guild) {
      guild.shard.send(payload);
    }
  },
  defaultSearchEngine: 'youtube'
}, new Connectors.DiscordJS(Twokei), Nodes, shoukakuOptions);