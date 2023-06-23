import {Connectors} from 'shoukaku';

import {Xiao} from '../music/controllers/Xiao';
import {Nodes, shoukakuOptions} from '../music/options';
import {Twokei} from './Twokei';

export const xiao = new Xiao({
  send: (guildId, payload) => {
    const guild = Twokei.guilds.cache.get(guildId);
    if (guild) {
      guild.shard.send(payload);
    }
  },
  defaultSearchEngine: 'youtube'
}, new Connectors.DiscordJS(this), Nodes, shoukakuOptions);