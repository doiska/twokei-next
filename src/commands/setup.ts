import { createCommand } from 'twokei-framework';
import { channelMention } from 'discord.js';
import { setupNewChannel } from '../modules/setup-new-channel';

export const setupCommand = createCommand({
  name: 'setup',
  description: 'Setup the bot.'
}, async (context) => {

  try {
    const newChannel = await setupNewChannel(context.channel!, context.member!);
    return `Setup complete, you can now use ${channelMention(newChannel.id)} to request songs.`;
  } catch (error) {

    if(error instanceof Error) {
      return error.message;
    }

    return `Something went wrong.`;
  }
});