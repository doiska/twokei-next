import { APISelectMenuOption } from 'discord.js';

import { TrackQueue } from '../structures/TrackQueue';
import { assertMenuSize } from '../../utils/embed-utils';

export const parseTracksToMenuItem = (tracks: TrackQueue) => {
  const items = tracks.map((track, index) => ({
    label: track.title,
    value: index.toString(),
    description: track.author,
  } as APISelectMenuOption));

  const { current } = tracks;
  const { previous } = tracks;

  if (current) {
    items.unshift({
      default: true,
      label: current.title,
      value: 'current',
      description: current.author,
    });
  }

  if (previous) {
    items.unshift({
      label: previous.title,
      value: 'previous',
      description: previous.author,
    });
  }

  return assertMenuSize(items);
};
