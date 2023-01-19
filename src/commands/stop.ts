import { CommandContext, createCommand } from "twokei-framework";
import { Twokei } from '../app/Twokei';

const execute = async (context: CommandContext) => {
	const { guild } = context;

	if (!guild) {
		return;
	}

	try {
		await Twokei.xiao.destroyPlayer(guild.id);
		return 'Player stopped.';
	} catch (error) {
		return `No player found.`;
	}
}

export const stopCommand = createCommand({
	name: "stop",
	description: "Stop playing",
	execute
})