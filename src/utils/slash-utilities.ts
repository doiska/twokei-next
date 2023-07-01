import { Twokei } from '../app/Twokei';

export function getCommands() {
  const commands = Twokei.application?.commands;

  console.log(commands);

  if (!commands) {
    return [];
  }

  return commands.cache.filter(Boolean).map((command) => ({
    ...command,
    toString() {
      return `</${command.name}:${command.id}>`;
    },
  }));
}
