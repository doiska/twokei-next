import {CommandContext, createCommand} from 'twokei-framework';

import {destroyPlayerInstance} from '../../music/heizou/destroy-player-instance';
import {getReadableException} from '../../structures/exceptions/utils/get-readable-exception';

const execute = async (context: CommandContext) => {
  const {member} = context;

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
  execute
});