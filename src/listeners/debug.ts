import { ApplyOptions } from "@sapphire/decorators";
import { container, Listener } from "@sapphire/framework";
import { Events, type Message, PermissionFlagsBits } from "discord.js";

@ApplyOptions<Listener.Options>({
  name: "debug-command-event",
  event: Events.MessageCreate,
})
export class DebugCommand extends Listener<typeof Events.MessageCreate> {
  public override async run(message: Message) {
    if (!message.channel.isTextBased() || !message.channel.isDMBased()) {
      return;
    }

    const { author, content } = message;

    if (author.id !== "226038466272690176") {
      return;
    }

    const [command, type, ...args] = content.split(" ");

    if (command !== "!debug") {
      return;
    }

    if (type === "permissions") {
      const [guildId] = args;

      if (!guildId) {
        return message.channel.send("Usage: !debug permissions <guildId>");
      }

      const guild = await message.client.guilds.fetch(guildId);

      if (!guild) {
        return message.channel.send("Guild not found");
      }

      const self = guild.members.me;

      if (!self) {
        return message.channel.send("I'm not in this guild");
      }

      const permissions = new Map<string, boolean>();

      for (const [key, value] of Object.entries(PermissionFlagsBits)) {
        permissions.set(key, self.permissions.has(value));
      }

      const readable = [...permissions.entries()]
        .sort(([, v]) => (v ? -1 : 1))
        .map(([key, value]) => {
          return `${key}: ${value}`;
        });

      message.channel.send(readable.join("\n"));
    }
  }
}

void container.stores.loadPiece({
  name: "debug-command",
  piece: DebugCommand,
  store: "listeners",
});
