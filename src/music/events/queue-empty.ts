import { XiaoEvents } from "../controllers/Xiao";
import { Events } from "../interfaces/player.types";
import { Twokei } from "../../app/Twokei";

export const queueEmpty: XiaoEvents[Events.QueueEmpty] = (venti) =>
    Twokei.xiao.destroyPlayer(venti.guildId)