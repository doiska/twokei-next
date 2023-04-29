import { createEvent } from 'twokei-framework';
import { Twokei } from '../app/Twokei';
import * as process from 'process';
import { logger } from "../modules/logger-transport";

export const onReady = createEvent('ready', async () => {
  if (process.env.GUILD_ID) {
    const guild = await Twokei.guilds.fetch(process.env.GUILD_ID!);

    Twokei.emit('guildCreate', guild);

    Twokei.application!.commands.fetch()
        .then(commands =>
            logger.info(`Loaded commands: ${commands.map(command => command.name).join(', ')}.`));
  }
});