import { registerCommand } from "../handlers/command/CommandRegister";

registerCommand({ name: "ping" },
  (context) => {
    return "Pong!";
  }
);
