import { ApplyOptions } from "@sapphire/decorators";
import { isVoiceBasedChannel } from "@sapphire/discord.js-utilities";
import { container, Listener } from "@sapphire/framework";
import { logger } from "@/modules/logger-transport";
import type { Venti } from "@/music/controllers/Venti";
import { Events } from "@/music/interfaces/player.types";
import type { ResolvableTrack } from "@/music/structures/ResolvableTrack";

@ApplyOptions<Listener.Options>({
  name: "song-user-track-end",
  event: Events.TrackEnd,
  emitter: container.xiao,
  enabled: true,
})
export class TrackEndEvent extends Listener<typeof Events.TrackEnd> {
  public async run(venti: Venti, track?: ResolvableTrack, reason?: string) {
    const current = track ?? venti.queue.current;

    logger.debug(`[TrackEnd] Track ended: ${reason ?? "No reason"}`);

    if (!current) {
      console.log("[TrackEnd] No current found");
      return;
    }

    if (reason && ["replaced", "error"].includes(reason.toLowerCase())) {
      console.log("[TrackEnd] Invalid reason");
      return;
    }

    const voiceChannelId = venti.voiceId;

    if (!voiceChannelId) {
      console.log("[TrackEnd] No voiceId");

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

    await Promise.allSettled(
      Array.from(connected.values()).map((member) =>
        fetch(`${process.env.RESOLVER_API_URL}/analytics/${member.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: "track_listened",
            track: {
              isrc: current.isrc,
              uri: current.uri,
              title: current.title,
              author: current.author,
              source: current.sourceName,
            },
          }),
        }),
      ),
    );
  }
}
