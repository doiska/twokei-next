import { ClientEvents, Events } from 'discord.js'
import { Twokei } from "../../app/Twokei";

export const registerEvent = <T extends keyof ClientEvents>(name: T, handler: (...args: ClientEvents[T]) => void) => {
  Twokei.on(name, handler);
};