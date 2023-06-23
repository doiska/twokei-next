import { Twokei } from '../../app/Twokei';
import { logger } from '../../modules/logger-transport';
import { XiaoEvents } from '../controllers/Xiao';
import { Events } from '../interfaces/player.types';

export const trackPause: XiaoEvents[Events.TrackPause] = (venti) => {
  logger.debug('[Xiao] Track started. Refreshing components...');

  const embed = Twokei.xiao.embedManager.get(venti.guildId);

  if (!embed) {
    return;
  }

  embed.refreshComponents().refresh();
};