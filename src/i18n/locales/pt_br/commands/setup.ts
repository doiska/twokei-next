import { Icons } from "@/constants/icons";

export default {
  channel_created: [
    `### ${Icons.Premium} Hey {{- user}}!`,
    "Graças a você, **{{- serverName}}** tem o **melhor bot de música**!",
    "### **Adicione músicas mencionando o bot com o link/nome da música.**",
    "-  {{- mention}} lofi hip hop",
    "Use o canal para controlar a fila, playlists e mais!",
    " ",
    `**Obrigado por fazer parte de nossa Vibe!** ${Icons.HanakoEating}`,
  ].join("\n"),
};
