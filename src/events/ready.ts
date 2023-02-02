import { createEvent } from 'twokei-framework';
import { Twokei } from '../app/Twokei';
import * as process from 'process';

export const onReady = createEvent('ready', async () => {
  const guild = await Twokei.guilds.fetch(process.env.GUILD_ID!);

  Twokei.emit('guildCreate', guild)
})