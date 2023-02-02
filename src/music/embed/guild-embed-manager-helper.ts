import { APISelectMenuOption } from 'discord.js';
import { Track } from 'shoukaku';
import { TrackQueue } from '../managers/TrackQueue';

export const parseTracksToMenuItem = (tracks: TrackQueue<Track>) => {

  const items = tracks.map((track, index) => {
    return {
      label: track.info.title,
      value: index.toString(),
      description: track.info.author
    } as APISelectMenuOption;
  });

  const current = tracks.current;
  const previous = tracks.previous;

  if (current) {
    console.log(current.info.title)
    items.unshift({
      default: true,
      label: `Current: ${current.info.title}`,
      value: 'current',
      description: current.info.author
    });
  }

  if (previous) {
    items.unshift({
      label: previous.info.title,
      value: 'previous',
      description: previous.info.author
    });
  }

  return items;
}