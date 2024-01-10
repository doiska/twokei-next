import {
  ActionRowBuilder,
  type SelectMenuComponentOptionData,
  StringSelectMenuBuilder,
} from "discord.js";

import { Menus } from "@/constants/music/player-buttons";
import { type TrackQueue } from "@/music/structures/TrackQueue";
import { assertMenuSizeLimits } from "@/utils/embed-utils";

export const createSelectMenu = (tracks?: TrackQueue) => {
  const noTrack = tracks?.length === 0 && !tracks.current && !tracks.previous;

  const options = tracks
    ? parseTracksToMenuItem(tracks)
    : [
        {
          default: true,
          label: "Add more songs to use the select-menu!",
          value: "add-more-songs",
          emoji: {
            name: "light",
            id: "1069597636950249523",
          },
        },
      ];

  return new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
      new StringSelectMenuBuilder()
        .setCustomId(Menus.SelectSongMenu)
        .setPlaceholder("Select a song")
        .setMinValues(0)
        .setMaxValues(1)
        .setDisabled(noTrack)
        .setOptions(options),
    ],
  });
};

const parseTracksToMenuItem = (tracks: TrackQueue) => {
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
      value: "current",
      description: current.author,
    });
  }

  if (previous) {
    items.unshift({
      label: previous.title,
      value: "previous",
      description: previous.author,
    });
  }

  return assertMenuSizeLimits(items);
};
