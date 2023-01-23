import { Events } from '../interfaces/player.types';
import { XiaoEvents } from '../controllers/Xiao';

export const trackStart: XiaoEvents[Events.TrackStart] = (venti, track) => {

  if (venti.scara) {
    venti.scara
      .setEmbed({
        author: {
          name: `${track.info.isStream ? '(**LIVE**) | ' : ''}${track.info.title}`,
          url: track.info.uri,
        },
        url: track.info.uri,
        video: {
          url: track.info.uri
        },
      })
      .refreshComponents()
      .refresh();
  }
}