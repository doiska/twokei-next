import { Twokei } from '../app/Twokei';

export const getCommand = async (commandName: string) => {
  const commands = await Twokei.getCommands();

  const found = commands.find((command) => command.name === commandName);

  if(!found) {
    return;
  }

  return {
    ...found,
    toString() {
      return `</${found.name}:${found.id}>`
    }
  }
}