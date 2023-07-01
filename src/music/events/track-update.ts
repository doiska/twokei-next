import { xiao } from '../../app/Xiao';
import { Venti } from '../controllers/Venti';

// TODO: Why do not update the component when the track starts?
// export const trackStart: XiaoEvents[Events.TrackStart] = (venti) => {
//   logger.debug('[Xiao] Track started. Refreshing components...');
//
//   const embed = xiao.embedManager.get(venti.guildId);
//
//   if (!embed) {
//     return;
//   }
//
//   if (venti.playing) {
//     embed.refreshComponents();
//   }
//
//   embed.refreshEmbed().refresh();
// };

type UpdateEvents = (venti: Venti) => void;

export const trackUpdate: UpdateEvents = (venti: Venti) => {
  const embed = xiao.embedManager.get(venti.guildId);

  if (!embed) {
    return;
  }

  if (!venti.playing) {
    embed.refreshEmbed();
  }

  embed.refreshComponents().refreshEmbed().refresh();
};
