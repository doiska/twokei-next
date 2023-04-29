import { ResourceLanguage } from 'i18next';

export default {
  name: 'Twokei',
  onJoin: [
    'Opa, obrigado pelo convite! :)',
    'Vou te explicar como funciono:',
    '',
    '<:2K:1068954133320708116> **Primeiro, você pode criar um canal para mim.**',
    '1. Se você criar o canal, você ainda pode usar o comando (ou me mencionar).',
    '2. Para criar o canal, clique no botão `Configurar` abaixo.',
    '',
    ':sob: **Se você não quiser usar o canal, tem algumas opções:**',
    '- :mouse: O comando (clique aqui): {{playCommand}}',
    `- :keyboard: Ou me mencione com a música: {{me}} [<url/busca>](https://youtu.be/dQw4w9WgXcQ)`
  ],
} as ResourceLanguage;