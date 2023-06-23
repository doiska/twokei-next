import { APISelectMenuOption } from 'discord.js';

import { assertMenuSize } from '../../utils/embed-utils';
import { TrackQueue } from '../structures/TrackQueue';

export const parseTracksToMenuItem = (tracks: TrackQueue) => {

  const items = tracks.map((track, index) => {
    return {
      label: track.title,
      value: index.toString(),
      description: track.author
    } as APISelectMenuOption;
  });

  const current = tracks.current;
  const previous = tracks.previous;

  if (current) {
    items.unshift({
      default: true,
      label: current.title,
      value: 'current',
      description: current.author
    });
  }

  if (previous) {
    items.unshift({
      label: previous.title,
      value: 'previous',
      description: previous.author
    });
  }

  return assertMenuSize(items);
};