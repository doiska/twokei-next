import { ClientEvents, Events } from 'discord.js'
import { Twokei } from "../../app/Twokei";
import { Player } from "shoukaku";
import { PlayerEventType } from "shoukaku/dist/src/guild/Player";

export const registerEvent = <T extends keyof ClientEvents>(name: T, handler: (...args: ClientEvents[T]) => void) => {
  Twokei.on(name, handler);
};