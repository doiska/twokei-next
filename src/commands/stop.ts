import { CommandContext, createCommand } from "twokei-framework";

const execute = async (context: CommandContext) => {
	const { guild } = context;

	if (!guild) {
		return;
	}

	const player = context.client.xiao.getPlayer(guild.id);

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