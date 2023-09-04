import { ApplyOptions } from "@sapphire/decorators";
import { isVoiceBasedChannel } from "@sapphire/discord.js-utilities";
import { container, Listener } from "@sapphire/framework";
import type { Track } from "shoukaku";
import { logger } from "@/modules/logger-transport";
import type { Venti } from "@/music/controllers/Venti";
import { Events } from "@/music/interfaces/player.types";

@ApplyOptions<Listener.Options>({
  name: "song-user-track-end",
  event: Events.TrackEnd,
  emitter: container.xiao,
  enabled: true,
})
export class TrackEndEvent extends Listener<typeof Events.TrackEnd> {
  public async run(venti: Venti, _?: Track, reason?: string) {
    const current = venti.queue.current;

    logger.debug(`[TrackEnd] Track ended: ${reason ?? "No reason"}`);

    if (reason && ["replaced", "error"].includes(reason.toLowerCase())) {
      return;
    }

    if (!current) {
      return;
    }

    if (current.length && current.length < 10000) {
      return;
    }

    const voiceChannelId = venti.voiceId;

    if (!voiceChannelId) {
      return;
    }

    const voiceChannel = await container.client.channels.fetch(voiceChannelId);

    if (!voiceChannel || !isVoiceBasedChannel(voiceChannel)) {
      return;
    }

    const connected = voiceChannel.members.filter(
      (member) => !member.user.bot && !member.voice.selfDeaf,
    );

    if (connected.size === 0) {
      return;
    }

    await container.analytics.track({
      event: "heard_song",
      guild: venti.guildId,
      users: connected.map((member) => member.id),
      track: current.short(),
    });
  }
}
