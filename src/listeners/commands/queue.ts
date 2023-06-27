import {CommandContext, createCommand, MessageBuilder} from 'twokei-framework';

import {xiao} from '../../app/Xiao';
import {logger} from '../../modules/logger-transport';


const execute = async (context: CommandContext) => {

  const {member} = context;

  if (!member || !member?.guild) {
    logger.error('No member or guild');
    return;
  }

  const player = await xiao.getPlayer(member.guild.id);

  if (!player) {
    return 'No player found';
  }

  const _queue = [player.queue.current, ...player.queue];

  const map = _queue
    .filter(Boolean)
    .map((track, index) => `${index + 1}. [${track?.title}](${player.queue.current?.uri || ''})`);

  const isPlaying = player.playing;

  return new MessageBuilder({
    embeds: [
      {
        title: isPlaying ? `Now playing ${player.queue.current?.title}` : `Paused ${player.queue.current?.title}`,
        url: player.queue.current?.uri || '',
        description: map.join('\n') || 'No tracks in queue'
      }
    ]
  });
};

export const queueCommand = createCommand({
  name: 'queue',
  description: 'List songs',
  execute
});