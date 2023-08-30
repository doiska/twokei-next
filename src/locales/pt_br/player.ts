import { Icons } from "@/constants/icons";
import { EmbedButtons, PlayerButtons } from "@/constants/music/player-buttons";

export default {
  embed: {
    description: [
      "## <a:raio:1121849523854118973> [Twokei Music](https://twokei.com)",
      " ",
      `### ${Icons.Hanakin} Como usar?`,
      "- **Mencione** o bot com o nome/url da música para adicionar à fila.",
      '- Exemplo: "**{{- mention}} lofi hiphop**"',
      "- **Controle a fila no Menu de Faixas abaixo!**",
      `### ${Icons.SpotifyLogo} Profile Sync (Beta)`,
      "- **Traga suas playlists do ``Spotify`` para o Twokei!**",
      "- Clique no botão **$t(player:embed.buttons.PLAYLIST_SYNC)** abaixo.",
    ],
    description_playing: [
      " ",
      "### 🎶 Tocando agora",
      "- **{{- track.title}}**",
      "- Artista: {{- track.author}}",
      "- A pedido de: **{{- track.requestedBy}}**",
    ],
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
      [EmbedButtons.VIEW_RANKING]: "Ver Ranking",
      [EmbedButtons.PLAYLIST_SYNC]: "Playlists Sincronizadas",
      [EmbedButtons.IA_MODE]: "Modo IA - Premium",
      [EmbedButtons.QUICK_PLAYLIST]: "Ouvir Playlist recomendada",
      invite: "Convite",
      donate: "Apoiar desenvolvimento",
      [EmbedButtons.NEWS]: "Ver Novidades",
    },
  },
  play: {
    embed: {
      author: {
        name: "Solicitado por {{- member.name}}!",
        icon_url: "{{- member.avatarUrl}}",
      },
      description_track: [
        "### Track adicionada!",
        "{{track.author}} - [{{- track.title}}]({{- track.uri}})",
      ].join("\n"),
      description_playlist: [
        "### {{playlist.name}} adicionada com {{playlist.amount}} músicas",
        "- Perk do servidor: Auto-Shuffle habilitado!",
      ].join("\n"),
      thumbnail: {
        url: "{{- track.thumbnail}}",
      },
    },
    with_songs: "Com outras {{amount}} faixas",
    buttons: {
      like: "Like",
      dislike: "Dislike",
      view_source: "Ver no {{source}}",
    },
    feedback: ["Obrigado pelo feedback!", "Ajustaremos suas recomendações :)"],
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
  ],
};
