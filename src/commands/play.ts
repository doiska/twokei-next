import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";

import { playSong } from "@/features/music/play-song";

@ApplyOptions<Command.Options>({
  name: "play",
  aliases: ["p"],
  description: "Play a song from any source!",
  enabled: true,
  preconditions: ["GuildTextOnly", "ShoukakuReady"],
  cooldownDelay: 1_000,
})
export class PlayCommand extends Command {
  registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option.setName("search").setDescription("Input").setRequired(true),
        ),
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const search = interaction.options.getString("search");

    if (!search) {
      return;
    }

    await playSong(interaction, search);
  }
}
