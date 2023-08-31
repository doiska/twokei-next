import { ApplyOptions } from "@sapphire/decorators";
import {
  isGuildMember,
  isVoiceBasedChannel,
} from "@sapphire/discord.js-utilities";
import { container, Listener } from "@sapphire/framework";
import type { Track } from "shoukaku";

import { kil } from "@/db/Kil";
import { users } from "@/db/schemas/users";

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

    // if (reason && ["replaced", "error"].includes(reason.toLowerCase())) {
    //   return;
    // }

    if (!current) {
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

    console.log(current);

    const payload = JSON.stringify({
      event: "track_add",
      track: {
        title: current.title,
        isrc: current.isrc,
        uri: current.uri,
        author: current.author,
        source: current.sourceName,
      },
    });

    await Promise.allSettled(
      [...connected.values()].map(async (guildMember) => {
        if (!isGuildMember(guildMember)) {
          return;
        }

        return fetch(
          `${process.env.RESOLVER_URL}/analytics/${guildMember.id}`,
          {
            method: "POST",
            body: payload,
            headers: {
              "Content-Type": "application/json",
              Authorization: process.env.RESOLVER_KEY!,
            },
          },
        );
      }),
    );

    await kil.transaction(async (tx) => {
      await tx
        .insert(users)
        .values(
          connected.map((member) => ({
            id: member.id,
            name: member.user.username,
          })),
        )
        .onConflictDoNothing();

      const track = {
        event: "heard_song",
        source: "Guild",
        properties: {
          guildId: venti.guildId,
          track: current.short(),
        },
      } as const;

      await container.analytics.track(
        connected.map((member) => ({
          userId: member.id,
          ...track,
        })),
      );
    });
  }
}
