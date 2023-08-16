import { Icons } from '@/constants/icons';

export default {
  embed: {
    ranking_world: '#{{rank.position}} no mundo',
    title_ranked: '## {{tag}} {{rank.emoji}} $t(profile:embed.ranking_world)',
    title_unranked: '## {{tag}} - Sem rank :(',
    premium: `# ${Icons.Premium} Premium`,
    description: [
      '- ⭐ {{followers}} seguidores',
      '- 🎧 {{listened}} músicas ouvidas',
    ],
  },
  suggestion: [
    '### Veja o perfil de outros ouvintes!',
    'Clique com o **botão direito no usuário > Apps > Ver perfil de música**',
    'Ou digite o comando {{- command_profile}} @usuário',
  ].join('\n'),
  profile_not_setup: 'Parece que você não configurou seu perfil ainda, clique em **Meu perfil**',
};
