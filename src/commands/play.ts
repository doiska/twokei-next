import { CommandContext, CommandResponse, createCommand } from "twokei-framework";

import { PlayerException } from "../structures/PlayerException";
import { play } from '../modules/heizou/play';

const execute = async (context: CommandContext<{ search: string }>): Promise<CommandResponse> => {

	const { t } = context;


	if(!context.member) {
		return;
	}

	try {
		const [track, ...rest] = await play(context.input.search, context.member);

		return t(`Added **${track.info.title}** ${rest.length > 1 ? `with other ${rest.length} songs to the queue` : ''}`);
	} catch (e) {
		if (e instanceof PlayerException) {
			return t(e.message);
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
								.setName("search")
								.setDescription("Input")
								.setRequired(true)
				)
	},
	execute: execute,
});