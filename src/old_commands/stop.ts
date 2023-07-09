import { getReadableException } from '../structures/exceptions/utils/get-readable-exception';
import { destroyPlayerInstance } from '../music/heizou/destroy-player-instance';
import { CommandContext, createCommand } from '../../../twokei-framework';

const execute = async (context: CommandContext) => {
  const { member } = context;

  if (!member) {
    return;
  }

  return destroyPlayerInstance(member)
    .then(() => 'Stopped')
    .catch(getReadableException);
};

export const stopCommand = createCommand({
  name: 'stop',
  description: 'Stop playing',
  execute,
});
