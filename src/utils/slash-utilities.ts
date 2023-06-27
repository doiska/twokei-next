import {Twokei} from '../app/Twokei';

export const getCommand = (commandName: string) => {
  const found = Twokei.getCommands().find((command) => command.name === commandName);

  if (!found) {
    return;
  }

  return {
    ...found,
    toString() {
      return `</${found.name}:${found.id}>`;
    }
  };
};

export function getCommands() {
  return Twokei.getCommands().map((command) => ({
    ...command,
    toString() {
      return `</${command.name}:${command.id}>`;
    }
  }));
}