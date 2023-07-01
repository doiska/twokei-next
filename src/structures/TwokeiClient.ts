import { SapphireClient } from '@sapphire/framework';
import { ClientOptions } from 'discord.js';

export class TwokeiClient extends SapphireClient {
  constructor(options: ClientOptions) {
    super(options);
  }
}
