import { Events } from '../interfaces/player.types';
import { XiaoEvents } from '../controllers/Xiao';
import { Twokei } from '../../app/Twokei';
import { logger } from '../../modules/logger-transport';

export const trackStart: XiaoEvents[Events.TrackStart] = (venti) => {
  logger.debug(`[Xiao] Track started. Refreshing components...`)

  const embed = Twokei.xiao.embedManager.get(venti.guildId);

  if (!embed) {
    return;
  }

  if (venti.playing) {
    embed.refreshComponents();
  }

  embed.refreshEmbed().refresh();
}