import { red } from "kleur";
import { registerCommand } from "../handlers/command/CommandRegister";
import { CommandContext } from "../handlers/command/command.types";

registerCommand({ name: "ping", description: "Pong!" }, (context) => {

});
