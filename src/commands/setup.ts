import { createCommand } from 'twokei-framework';
import { channelMention } from 'discord.js';
import { setupNewChannel } from '../modules/setup-new-channel';
import { getReadableException } from '../exceptions/utils/get-readable-exception';

export const setupCommand = createCommand({
  name: 'setup',
  description: 'Setup the bot.'
}, async (context) => {

  return setupNewChannel(context.channel!, context.member!).then(newChannel =>
    `Setup complete, you can now use ${channelMention(newChannel.id)} to request songs.`)
    .catch(getReadableException);
});