import { Icons } from "@/constants/icons";

export default {
  embed: {
    main: [
      `# ${Icons.Ranking} Twokei Global Ranking`,
      "### Usuários que mais ouviram músicas no Twokei.",
      "> Ranking atualizado a cada **15 minutos**.",
      "",
    ].join("\n"),
    ephemeral: [
      `Você está em **#{{currentPosition.position}} lugar** com **{{currentPosition.listened}} ouvidos**.`,
      `Suba no Ranking **escutando** músicas no {{- mention}}.`,
      " ",
      `Obrigado por fazer parte da nossa vibe! ${Icons.HanakoEating}`,
    ].join("\n"),
    refreshedAt: "**Última atualização:** {{- time}}",
  },
  rules: [
    `# ${Icons.Ranking} Regras do Ranking`,
    "",
    "### Qualquer usuário pode participar do Ranking, basta ouvir músicas no Twokei.",
    "- O Top Global é atualizado a cada **15 minutos**.",
    "- Apenas músicas com mais de **30 segundos** são elegíveis.",
    "- Músicas repetidas (seguidas) não são contabilizadas.",
    `### Faça parte do Top 3 e seja premiado com **${Icons.Premium} Premium**!`,
    "",
    `${Icons.HanakoEating} **Obrigado por fazer parte da nossa vibe!**`,
  ].join("\n"),
};
