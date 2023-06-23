export default {
  'track_one': 'faixa',
  'track_others': 'faixas',
  'song_added': '**{{track}}** adicionado à fila',
  'playlist_added': '**{{track}}** adicionado à fila com outras {{rest}} tracks.',
  'embed': {
    'description': [
      '## <a:raio:1121849523854118973> [Twokei Music](https://twokei.com)',
      ' ',
      '### <:hanakin:1121884455225786478> Como usar?',
      '- **Mencione** o bot com o nome/url da música para adicionar à fila.',
      '- Exemplo: "**{{- mention}} lofi hiphop**"',
      '### <:spotify:1121851501715931187> Spotify Sync',
      '- Sincronize seu **Spotify**, use {{- command_sync}} (link do perfil)!',
      '- Apenas playlists públicas são suportadas.',
      '### 🎨 Gostou da arte?',
      '- **Nome:** {{- art.name}}',
      '- **Autor:** [{{- art.author}}]({{- art.authorUrl}})',
    ],
    'buttons': {
      'stop': 'Parar',
      'previous': 'Anterior',
      'next': 'Próximo',
      'pause': 'Pausar',
      'resume': 'Continuar',
      'skip': 'Pular',
      'shuffle': 'Embaralhar',
      'loop': 'Loop',
      'loop_none': 'Loop',
      'loop_track': 'Loop: Faixa',
      'loop_queue': 'Loop: Fila',
      'auto_play': 'Autoplay',
      'select_language': 'Alterar idioma',
      'load_playlist': 'Carregar playlist',
      'sync_playlist': '(Soon) Importar Playlist do Spotify',
      'save_this_playlist': 'Save current queue',
      'your_playlists': '(Soon) Saved playlists',
      'donate': 'Contribua com o desenvolvimento',
    }
  },
  'player': {
    'now_playing': 'Now playing 🎶',
    'commands': {
      'loop': {
        'success': 'Loop state set to **{{loop}}**'
      }
    }
  }
};