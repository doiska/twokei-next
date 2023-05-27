import { createEvent } from 'twokei-framework';
import { Events } from 'discord.js';

export const newGuildJoin = createEvent(Events.GuildCreate, async guild => {

})