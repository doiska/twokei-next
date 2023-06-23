import { channelMention, PermissionsBitField } from 'discord.js';

import { createCommand } from 'twokei-framework';

import { setupNewChannel } from '../../modules/config/setup-new-channel';
import { getReadableException } from '../../structures/exceptions/utils/get-readable-exception';

export const setupCommand = createCommand({
  name: 'setup',
  description: 'Setup the bot.',
  slash: slash => slash.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
}, async (context) => {

  if(!context.guild) {
    return;
  }

  return setupNewChannel(context.guild).then(newChannel =>
    `Setup complete, you can now use ${channelMention(newChannel.id)} to request songs.`)
    .catch(getReadableException);
});