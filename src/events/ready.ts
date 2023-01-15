import { createEvent } from "twokei-framework";
import { TextChannel } from "discord.js";
import { Twokei } from "../app/Twokei";
import { createEmbedIfNotExists } from '../embed/SongEmbed';

export const readyEvent = createEvent('ready',async (client) => {
  const channel = await client.channels.fetch('1063639091498991656') as TextChannel;
  
  await createEmbedIfNotExists(channel)
})