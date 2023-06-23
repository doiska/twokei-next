import {xiao} from '../../app/Xiao';
import { logger } from '../../modules/logger-transport';
import { XiaoEvents } from '../controllers/Xiao';
import { Events } from '../interfaces/player.types';

export const trackStart: XiaoEvents[Events.TrackStart] = (venti) => {
  logger.debug('[Xiao] Track started. Refreshing components...');

  const embed = xiao.embedManager.get(venti.guildId);

  if (!embed) {
    return;
  }

  if (venti.playing) {
    embed.refreshComponents();
  }

  embed.refreshEmbed().refresh();
};