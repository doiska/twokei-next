import { Icons } from "@/constants/icons";
import { EmbedButtons, PlayerButtons } from "@/constants/buttons";

export default {
  embed: {
    description: [
      "## <a:raio:1121849523854118973> [Twokei Music](https://twokei.com)",
      `### ${Icons.Hanakin} Como usar?`,
      "- **Mencione** o bot com o nome/url da música para adicionar à fila.",
      '- Exemplo: "**{{- mention}} lofi hiphop**"',
      "- **Controle a fila no Menu de Faixas abaixo!**",
      `### ${Icons.SpotifyLogo} Não sabe o que ouvir? Use nossos Presets!`,
      `- **Clique no menu abaixo e escolha uma categoria**.`,
      `- A **fila deve estar vazia** para usar ${Icons.Hanakin}`,
      "### 🎨 Arte feita por: [{{- artwork.name}}]({{- artwork.url}})",
      "- Quer ver sua arte aqui? Envie em [nosso site](https://artwork.twokei.com)!",
    ].join("\n"),
    buttons: {
      [PlayerButtons.STOP]: "Parar",
      [PlayerButtons.PREVIOUS]: "Anterior",
      [PlayerButtons.PAUSE]: "Pausar",
      [PlayerButtons.RESUME]: "Continuar",
      [PlayerButtons.SKIP]: "Pular",
      [PlayerButtons.SHUFFLE]: "Embaralhar",
      loop: {
        none: "Loop",
        track: "Loop (Track)",
        queue: "Loop (Queue)",
      },
      select_language: "Alterar idioma",
      [EmbedButtons.VIEW_PROFILE]: "Meu Perfil",
      [EmbedButtons.VIEW_RANKING]: "Ranking Global",
      [EmbedButtons.NEWS]: "Novidades",
      [EmbedButtons.DONATE]: "Doações",
    },
  },
  play: {
    added_to_queue: `${Icons.Lightning} Adicionado à fila!`,
    more_songs: "+ {{amount}} faixas",
    buttons: {
      like: "Like",
      dislike: "Dislike",
      view_source: "Ver no {{source}}",
    },
    feedback: "Ajustaremos suas recomendações :)",
  },
  player: {
    now_playing: "Now playing 🎶",
    commands: {
      loop: {
        success: "Loop state set to **{{loop}}**",
      },
    },
  },
  youtube_disabled: [
    "## :sob: Links do YouTube",
    "Você está tentando utilizar um link do **YouTube**, não permitimos **playbacks/buscas no YouTube**.",
    "**Buscaremos pelo título e autor em outra plataforma**.",
  ].join("\n"),
};
