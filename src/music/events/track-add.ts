import { Twokei } from '../../app/Twokei';
import { XiaoEvents } from '../controllers/Xiao';
import { Events } from '../interfaces/player.types';

export const trackAdd: XiaoEvents[Events.TrackAdd] = (venti) => {
  const embed = Twokei.xiao.embedManager.get(venti.guildId);

  if (!embed) {
    return;
  }

  embed
    .refreshComponents()
    .refresh();
};