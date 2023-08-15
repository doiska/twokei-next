import { Icons } from '@/constants/icons';

export default {
  track_one: 'faixa',
  track_others: 'faixas',
  song_added: '**{{track}}** adicionado à fila',
  playlist_added:
    '**{{track}}** adicionado à fila com outras {{track_count}} tracks.',
  requested_by: 'Solicitado por: {{name}}',
  embed: {
    description: [
      '## <a:raio:1121849523854118973> [Twokei Music](https://twokei.com)',
      ' ',
      '### <:hanakin:1121884455225786478> Como usar?',
      '- **Mencione** o bot com o nome/url da música para adicionar à fila.',
      '- Exemplo: "**{{- mention}} lofi hiphop**"',
      '- Use **Spotify ou Youtube**, você escolhe!',
      `### ${Icons.SpotifyLogo} Profile Sync`,
      '- **Traga suas playlists do ``Spotify & Deezer`` para o Twokei!**',
      '- Clique no botão **Meu Perfil** abaixo.',
    ],
    description_playing: [
      ' ',
      '### 🎶 Tocando agora',
      '- **{{- track.title}}**',
      '- Artista: {{- track.author}}',
      '- A pedido de: **{{- track.requestedBy}}**',
    ],
    loop: {
      track: 'Loop: Track',
      queue: 'Loop: Queue',
    },
    buttons: {
      stop: 'Parar',
      previous: 'Anterior',
      next: 'Próximo',
      pause: 'Pausar',
      resume: 'Continuar',
      skip: 'Pular',
      shuffle: 'Embaralhar',
      loop: {
        none: 'Loop',
        track: 'Loop (Track)',
        queue: 'Loop (Queue)',
      },
      auto_play: 'Autoplay',
      select_language: 'Alterar idioma',
      view_profile: 'Ver Perfil',
      load_playlist: 'Playlists',
      save_playlist: 'Salvar playlist atual',
      your_playlists: 'Saved playlists',
      invite: 'Convite',
      donate: 'Apoiar desenvolvimento',
    },
  },
  play: {
    embed: {
      author: {
        name: 'Solicitado por {{- member.name}}!',
        icon_url: '{{- member.avatarUrl}}',
      },
      description_track: [
        '### Track adicionada!',
        '{{track.author}} - [{{- track.title}}]({{- track.uri}})',
      ].join('\n'),
      description_playlist: '### {{playlist.name}} adicionada com {{playlist.amount}} músicas',
      thumbnail: {
        url: '{{- track.thumbnail}}',
      },
    },
    with_songs: 'Com outras {{amount}} faixas',
    buttons: {
      like: 'Like',
      dislike: 'Dislike',
      view_source: 'Ver no {{source}}',
    },
    feedback: [
      'Obrigado pelo feedback!',
      'Ajustaremos suas recomendações :)',
    ],
  },
  player: {
    now_playing: 'Now playing 🎶',
    commands: {
      loop: {
        success: 'Loop state set to **{{loop}}**',
      },
    },
  },
};
