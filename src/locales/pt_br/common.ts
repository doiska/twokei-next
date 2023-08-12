import { hyperlink } from 'discord.js';

import { type ResourceLanguage } from 'i18next';

export default {
  name: 'Twokei',
  join_embed: {
    title: '⚡ E ai! Eu sou o Twokei!',
    description: [
      '## Como você prefere usar?',
      '- É coisa rápida, prometo!',
      '### Siga a ordem (recomendado 👀)',
      '- Crio um canal para você e seus amigos (~~se tiver~~ 😅) ouvirem música.',
      '- Nesse canal você muda as faixas, volume, fila, etc.',
      '- Para criar o canal, clique no botão `Criar canal` abaixo.',
      '### Abrace o caos, tá tudo bem! 😉',
      '- Selecione a opção `Apenas comandos` abaixo.',
      '- Ainda poderá usar o comando (ou me mencionar).',
      '- Se mudar de ideia, use o comando `/setup` novamente.',
      '',
      '',
    ],
  },
  donate: {
    description: [
      '## <a:hanakoeating:1121884717290094652> Como me ajudar no desenvolvimento?',
      '- O desenvolvimento é feito por uma única pessoa.',
      '- Você pode me ajudar com uma doação (clicando no botão abaixo).',
      '- Votando no **Twokei** em: [top.gg](https://top.gg/bot/804289482624587274/vote).',
      '- E convidando para outros servidores.',
      '### O que eu ganho com isso?',
      '- Você me ajuda a continuar desenvolvendo.',
      '- E desbloqueia acesso ao **Spotify Sync**.',
      '### <:spotify:1121851501715931187> Spotify Sync',
      '- Sincroniza suas playlists públicas do Spotify com o bot.',
      '- Assim você pode ouvir suas músicas favoritas no Discord.',
      '- E ainda pode compartilhar com seus amigos.',
    ],
    pix: {
      description: [
        '## Muito obrigado! 🥰',
        '- Você pode fazer uma doação usando o Pix.',
        '- Basta escanear o QR Code abaixo.',
        '- Ou copiar o código e colar no seu app do banco.',
        '### Chave Pix',
        '```',
        '12321312312',
        '```',
      ],
    },
    buttons: {
      pix: 'Pix (Brasil)',
      paypal: 'PayPal',
      vote: 'Votar',
    },
  },
  invite_embed: [
    '## Convide o Twokei para seu servidor! :)',
    `### Clique no botão ou copie o link: ${hyperlink('twokei.com', 'https://twokei.com/?utm_campaign=invite_button&utm_medium=discord&utm_source=bot', 'Site do Twokei')}`,
    'Ouça música em alta qualidade no próprio Discord.',
    'Sem anúncios ou interrupções!',
  ],
} satisfies ResourceLanguage;
