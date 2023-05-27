import { createCommand } from 'twokei-framework';
import { channelMention, PermissionsBitField } from 'discord.js';
import { setupNewChannel } from '../../modules/setup-new-channel';
import { getReadableException } from '../../structures/exceptions/utils/get-readable-exception';

export const setupCommand = createCommand({
  name: 'setup',
  description: 'Setup the bot.',
  slash: slash => slash.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
}, async (context) => {

  return setupNewChannel(context.channel!, context.member!).then(newChannel =>
      `Setup complete, you can now use ${channelMention(newChannel.id)} to request songs.`)
      .catch(getReadableException);
});