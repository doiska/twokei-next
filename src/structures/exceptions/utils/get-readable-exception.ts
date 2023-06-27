import {Colors} from 'discord.js';
import {MessageBuilder} from 'twokei-framework';

import {logger} from '../../../modules/logger-transport';
import {FriendlyException} from '../FriendlyException';
import {PlayerException} from '../PlayerException';

export const getReadableException = (error: unknown) => {
  if (error instanceof FriendlyException || error instanceof PlayerException) {
    return new MessageBuilder({
      embeds: [{
        title: 'Oops! Something went wrong!',
        description: error.message,
        color: Colors.Red
      }]
    });
  }

  logger.debug('Handling readable exception', {error});

  throw error;
};