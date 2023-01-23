import { XiaoEvents } from '../controllers/Xiao';
import { Events } from '../interfaces/player.types';

export const playerDestroy: XiaoEvents[Events.PlayerDestroy] = (venti) => {

  if (venti.scara) {
    venti.scara
      .setEmbed()
      .setComponents([])
      .refresh();
  }
}