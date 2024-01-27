import {
  ActionRowBuilder,
  type SelectMenuComponentOptionData,
  StringSelectMenuBuilder,
} from "discord.js";

import { Menus } from "@/constants/music/player-buttons";
import { type TrackQueue } from "@/music/structures/TrackQueue";
import { assertMenuSizeLimits } from "@/utils/embed-utils";

export const createSelectMenu = (queue?: TrackQueue) => {
  const hasTracks = !!queue?.length || !!queue?.current;

  const options = hasTracks
    ? parseTracksToMenuItem(queue)
    : [
        {
          default: true,
          label: "Add more songs to use the select-menu!",
          value: "add-more-songs",
        },
      ];

  return new ActionRowBuilder<StringSelectMenuBuilder>({
    components: [
      new StringSelectMenuBuilder()
        .setCustomId(Menus.SelectSongMenu)
        .setPlaceholder("Select a song")
        .setMinValues(0)
        .setMaxValues(1)
        .setDisabled(!hasTracks)
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
