import { Twokei } from "../app/Twokei";
import {
	APIApplicationCommandOptionChoice,
} from "discord.js";
import { LoopStates } from "../xiao/Kazu";
import { CommandContext, createCommand } from "twokei-framework";

const execute = async (context: CommandContext<{ loop?: 'None' | 'Track' | 'Queue' }>) => {
	const { guild } = context;

	if (!guild) {
		return;
	}

	const player = await Twokei.xiao.getPlayer(guild.id);

	if (!player) {
		return;
	}

	const relationLoopStates = {
		"None": LoopStates.NONE,
		"Track": LoopStates.TRACK,
		"Queue": LoopStates.QUEUE
	}

	const loop = context.input.loop;
	const newLoopState = player.setLoop(loop ? relationLoopStates[loop] : undefined);

	return `Loop state: ${newLoopState}`;
}

export const loopCommand = createCommand({
	name: 'loop',
	description: 'Loop the current song or the queue',
	slash: (builder) => {

		const choices: APIApplicationCommandOptionChoice<string>[] = [
			{
				name: 'None',
				value: 'none'
			},
			{
				name: 'Track',
				value: 'track'
			},
			{
				name: 'Queue',
				value: 'queue'
			}
		]

		return builder
			.addStringOption(option => (
					option.setName('state')
						.setDescription('The type of loop')
						.setRequired(false)
						.addChoices(...choices)
				)
			)
	},
}, execute);