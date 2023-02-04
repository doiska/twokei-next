import { CommandContext, createCommand } from 'twokei-framework';
import { destroyPlayerInstance } from '../music/heizou/destroy-player-instance';
import { getReadableException } from '../exceptions/utils/get-readable-exception';

const execute = async (context: CommandContext) => {
  const { guild } = context;

  if (!guild) {
    return;
  }

  return destroyPlayerInstance(guild.id)
    .then(() => 'Stopped')
    .catch(getReadableException);
}

export const stopCommand = createCommand({
  name: 'stop',
  description: 'Stop playing',
  execute
})