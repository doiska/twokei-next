import { Events } from '../interfaces/player.types';
import { XiaoEvents } from '../controllers/Xiao';
import { Twokei } from '../../app/Twokei';

export const trackAdd: XiaoEvents[Events.TrackAdd] = (venti) => {
  const embed = Twokei.xiao.embedManager.get(venti.guildId);

  if (!embed) {
    return;
  }

  embed.refreshEmbed().refreshComponents().refresh();
}