import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { Client } from 'discord.js';
import { Events } from 'discord.js';

@ApplyOptions<Listener.Options>({
  name: 'ready-event',
  event: Events.ClientReady,
})
export class ReadyListener extends Listener {
  public run(client: Client) {
    const { username, id } = client.user!;
    this.container.logger.info(`Successfully logged in as ${username} (${id})`);

    console.log(client.guilds.cache.first());

    this.container.client.emit('guildCreate', client.guilds.cache.first()!);
  }
}
