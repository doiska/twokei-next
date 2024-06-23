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
      const [guildId, channelId] = args;

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

      if (channelId) {
        const channel = await guild.channels.fetch(channelId);

        if (!channel) {
          return message.channel.send("Channel not found");
        }

        const permissionsInChannel = channel.permissionsFor(self);

        for (const [k, v] of Object.entries(permissionsInChannel.serialize())) {
          permissions.set(k, v);
        }

        const readable = [...permissions.entries()]
          .sort(([, v]) => (v ? -1 : 1))
          .map(([key, value]) => {
            return `${key}: ${value}`;
          });

        message.channel.send(`${channel.toString()}:\n${readable.join("\n")}`);
        return;
      }

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
