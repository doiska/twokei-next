import { Icons } from "@/constants/icons";

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
      "- Clique no botão **$t(palyer:embed.buttons.playlist_sync)** abaixo.",
    ],
    description_playing: [
      " ",
      "### 🎶 Tocando agora",
      "- **{{- track.title}}**",
      "- Artista: {{- track.author}}",
      "- A pedido de: **{{- track.requestedBy}}**",
    ],
    buttons: {
      stop: "Parar",
      previous: "Anterior",
      next: "Próximo",
      pause: "Pausar",
      resume: "Continuar",
      skip: "Pular",
      shuffle: "Embaralhar",
      loop: {
        none: "Loop",
        track: "Loop (Track)",
        queue: "Loop (Queue)",
      },
      auto_play: "Autoplay",
      select_language: "Alterar idioma",
      view_profile: "Meu Perfil",
      view_ranking: "Ver Ranking",
      playlist_sync: "Playlists Sincronizadas",
      ia_mode: "Modo IA - Premium",
      quick_playlist: "Ouvir Playlist recomendada",
      invite: "Convite",
      donate: "Apoiar desenvolvimento",
      news: "Ver Novidades",
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
