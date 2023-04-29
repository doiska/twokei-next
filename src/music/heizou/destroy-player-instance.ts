import { GuildResolvable } from 'discord.js';
import { Twokei } from '../../app/Twokei';

export const destroyPlayerInstance = async (guild: GuildResolvable) =>
    Twokei.xiao.destroyPlayer(guild);