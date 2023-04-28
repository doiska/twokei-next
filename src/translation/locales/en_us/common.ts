import { Resource, ResourceLanguage } from 'i18next';

export default {
  name: 'Twokei',
  onJoin: [
    'So you invited me to your server, thats great!',
    'Let me explain how I work:',
    '',
    '<:2K:1068954133320708116> **First, you can create a channel for me.**',
    '1. If you create the channel, you can **still use the command** (or mention).',
    '2. To create the channel, click the `Setup` button below.',
    '',
    ':sob: **If you dont want to use the channel, theres some options:**',
    '- :mouse: The command (click here): {{playCommand}}',
    `- :keyboard: Or mention me with the song: {{me}} [<url/search>](https://youtu.be/dQw4w9WgXcQ)`
  ]
} as ResourceLanguage;