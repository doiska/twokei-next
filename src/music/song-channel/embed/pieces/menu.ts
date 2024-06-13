import {
  ActionRowBuilder,
  type SelectMenuComponentOptionData,
  StringSelectMenuBuilder,
} from "discord.js";

import { Menus } from "@/constants/buttons";
import { type TrackQueue } from "@/music/structures/TrackQueue";
import { SelectMenuLimits } from "@sapphire/discord.js-utilities";

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
        .setOptions(options.slice(0, SelectMenuLimits.MaximumOptionsLength)),
    ],
  });
};

const parseTracksToMenuItem = (tracks: TrackQueue) => {
  const items: SelectMenuComponentOptionData[] = tracks
    .slice(0, 20)
    .map((track, index) => ({
      label: track.title,
      value: index.toString(),
      description: track.author,
    }));

  const { current, previous } = tracks;

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

  return items.map((item) => ({
    ...item,
    label: item.label.substring(
      0,
      SelectMenuLimits.MaximumLengthOfNameOfOption,
    ),
    description: item.description?.substring(
      0,
      SelectMenuLimits.MaximumLengthOfNameOfOption,
    ),
  }));
};
