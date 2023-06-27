import {xiao} from '@/app/Xiao';

import {XiaoEvents} from '../controllers/Xiao';
import {Events} from '../interfaces/player.types';

export const manualUpdate: XiaoEvents[Events.ManualUpdate] = (venti, update) => {

  if (!venti) {
    return;
  }

  if (!update?.embed && !update?.components) {
    return;
  }

  const embed = xiao.embedManager.get(venti.guildId);

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
};