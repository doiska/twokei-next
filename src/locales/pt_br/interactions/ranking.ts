import { Icons } from "@/constants/icons";

export default {
  embed: {
    main: [
      `# ${Icons.Ranking} Twokei Global Ranking`,
      " ",
      `### Seja parte do **Top 3** e receba todos os benefícios do **${Icons.Premium} Premium**!`,
      "",
    ].join("\n"),
    ephemeral: [
      `Você está em **#{{currentPosition.position}} lugar** com **{{currentPosition.listened}} músicas ouvidas**.`,
      `Suba no Ranking **escutando** músicas no {{- twokeiMention}}.`,
      " ",
      `Obrigado por fazer parte da nossa vibe! ${Icons.HanakoEating}`,
    ],
  },
};
