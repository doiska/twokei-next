import { type SelectMenuComponentOptionData } from 'discord.js';

import { assertMenuSize } from '@/utils/embed-utils';

import { type TrackQueue } from '../structures/TrackQueue';

export const parseTracksToMenuItem = (tracks: TrackQueue) => {
  const items: SelectMenuComponentOptionData[] = tracks.map((track, index) => ({
    label: track.title,
    value: index.toString(),
    description: track.author,
  }));

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
