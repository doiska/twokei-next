import { Events } from '../interfaces/player.types';
import { XiaoEvents } from '../controllers/Xiao';
import { Twokei } from '../../app/Twokei';

export const manualUpdate: XiaoEvents[Events.ManualUpdate] = (venti, update) => {

  if (!venti) {
    return;
  }

  if (!update?.embed && !update?.components) {
    return;
  }

  const embed = Twokei.xiao.embedManager.get(venti.guildId);

  if (!embed) {
    return;
  }

  if (update?.embed) {
    embed.refreshEmbed();
  }

  if (update?.components) {
    embed.refreshComponents();
  }

  embed.refresh();
}