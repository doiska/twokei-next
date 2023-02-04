import { Events } from '../interfaces/player.types';
import { XiaoEvents } from '../controllers/Xiao';
import { Twokei } from '../../app/Twokei';

export const trackAdd: XiaoEvents[Events.TrackAdd] = (venti) => {
  Twokei.xiao.embedManager.get(venti.guildId)?.from(venti)
    .refreshEmbed()
    .refreshComponents()
    .refresh();
}