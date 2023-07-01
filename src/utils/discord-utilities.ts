import {
  Guild, PermissionResolvable,
  PermissionsBitField,
} from 'discord.js';

function canDoGuildUtility(guild: Guild, permissions: PermissionResolvable[]) {
  const self = guild.members.me;

  if (!self) {
    return false;
  }

  const selfPermissions = self.permissions;

  console.log(selfPermissions);

  return permissions.every((permission) => selfPermissions.has(permission));
}

export function canCreateChannels(guild: Guild) {
  return canDoGuildUtility(guild, [
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageMessages,
    PermissionsBitField.Flags.SendMessages,
  ]);
}
