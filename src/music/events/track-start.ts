import { Events } from '../interfaces/player.types';
import { XiaoEvents } from '../controllers/Xiao';
import { Twokei } from '../../app/Twokei';

export const trackStart: XiaoEvents[Events.TrackStart] = (venti, track) => {
  console.log(`[Xiao] Track started. Refreshing components...`)

  Twokei.xiao.embedManager.get(venti.guildId)?.from(venti)
    .refreshEmbed()
    .refreshComponents()
    .refresh();
}