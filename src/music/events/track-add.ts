import { Events } from '../interfaces/player.types';
import { XiaoEvents } from '../controllers/Xiao';
import { Twokei } from '../../app/Twokei';

export const trackAdd: XiaoEvents[Events.TrackAdd] = (venti) => {
  console.log(`[Xiao] Track added to queue. Refreshing components...`);

  Twokei.xiao.embedManager.get(venti.guildId)?.from(venti)
    .refreshEmbed()
    .refreshComponents()
    .refresh();
}