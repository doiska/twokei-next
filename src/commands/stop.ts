import { CommandContext, createCommand } from "twokei-framework";
import { Twokei } from '../app/Twokei';

const execute = async (context: CommandContext) => {
	const { guild } = context;

	if (!guild) {
		return;
	}

	const player = Twokei.xiao.getPlayer(guild.id);

	if (!player) {
		return "No player found";
	}

	player.destroy();

	return `Stopped playing`;
}

export const stopCommand = createCommand({
	name: "stop",
	description: "Stop playing",
	execute
})