import { APISelectMenuOption } from 'discord.js';
import { Track } from 'shoukaku';
import { TrackQueue } from '../managers/TrackQueue';
import { assertMenuSize } from '../../utils/embed-utils';
import { logger } from '../../modules/logger-transport';

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
    logger.debug('Current track found, adding to menu items.');
    items.unshift({
      default: true,
      label: current.title,
      value: 'current',
      description: current.author
    });
  }

  if (previous) {
    logger.debug('Previous track found, adding to menu items.');
    items.unshift({
      label: previous.title,
      value: 'previous',
      description: previous.author
    });
  }

  return assertMenuSize(items);
}