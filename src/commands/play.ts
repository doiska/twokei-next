import { Twokei } from "../app/Twokei";
import { logger } from "../utils/Logger";
import { PlayerException } from "../structures/PlayerException";

import { CommandContext, CommandResponse, createCommand } from "twokei-framework";

const execute = async (context: CommandContext<{ input: string, input2: string }>): Promise<CommandResponse> => {

	const { member, t } = context;

	if (!member || !member?.guild) {
		logger.error("No member or guild");
		return;
	}

	try {
		const { input } = context.input;

		if (!input) {
			logger.error("No input provided");
			return;
		}

		if (!member.voice.channel?.id) {
			return;
		}

		const player = await Twokei.xiao.createPlayer({
			guild: member.guild.id,
			channel: member.voice.channel.id,
		})

		const result = await Twokei.xiao.search(input);

		if (!result.tracks.length) {
			return t("No tracks found");
		}

		player.queue.add(...result.tracks);

		if (!player.playing) {
			console.log("Not playing, playing now");
			player.play();
		}

		const [track, ...rest] = result.tracks;

		return t(`Added **${track.info.title}** ${rest.length > 1 ? `with other ${rest.length} songs to the queue` : ''}`);
	} catch (e) {
		if (e instanceof PlayerException) {
			return e.message;
		}

		return "An error occurred while trying to play the track.";
	}
}

export const playCommand = createCommand({
	name: "play",
	description: "Play a song",
	slash: (builder) => {
		return builder
				.addStringOption((option) =>
						option
								.setName("input")
								.setDescription("Input")
								.setRequired(true)
				)
	},
	execute: execute,
});