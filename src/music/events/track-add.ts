import { Events } from '../interfaces/player.types';
import { XiaoEvents } from '../controllers/Xiao';

export const trackAdd: XiaoEvents[Events.TrackAdd] = (venti) => {
  if(venti.scara) {
    console.log(`[Xiao] Track added to queue. Refreshing components...`);
    venti.scara
      .refreshComponents()
      .refresh();
  }
}