import { type ResourceLanguage } from 'i18next';

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
    '- :keyboard: Or mention me with the song: {{me}} [<url/search>](https://youtu.be/dQw4w9WgXcQ)',
  ],
  join_embed: {
    title: "⚡ Hey there! I'm Twokei!",
    description: [
      '## What do you prefer?',
      "- It's quick, I promise!",
      '### Everything organized (recommended 👀)',
      '- I create a channel for you and your friends (~~if you have any~~ 😅) listen to music.',
      '- In this channel you change tracks, volume, queue, etc.',
      '- To create the channel, click the `Setup` button below.',
      "### Embrace the chaos, it's okay! 😉",
      '- Select the `Only commands` option below.',
      '- You can still use the command (or mention me).',
      '- **If you change your mind, use the `/setup` command again.**',
      '',
    ],
  },
} satisfies ResourceLanguage;
