import { type NodeOption } from 'shoukaku';

export type OptionWithActive = NodeOption & { active?: boolean };

export const Nodes: OptionWithActive[] = [
  {
    name: 'Replit doiská',
    url: 'lavalink-replit-2.pedrolopes36.repl.co',
    secure: true,
    auth: 'maybeiwasboring',
  },
  // {
  //   name: 'AWS Eduardin',
  //   url: '15.228.220.230:2333',
  //   secure: false,
  //   auth: 'youshallnotpass',
  // },
  // {
  //   name: 'lava1.horizxon.studio:80',
  //   url: 'lava1.horizxon.studio',
  //   secure: false,
  //   auth: 'horizxon.studio',
  // },
  // {
  //   name: 'lava3.horizxon.studio:80',
  //   url: 'lava3.horizxon.studio',
  //   secure: false,
  //   auth: 'horizxon.studio',
  // },
  // {
  //   name: 'lava4.horizxon.studio:80',
  //   url: 'lava4.horizxon.studio',
  //   secure: false,
  //   auth: 'horizxon.studio',
  // },
  // {
  //   name: 'narco.buses.rocks:2269',
  //   url: 'narco.buses.rocks',
  //   secure: true,
  //   auth: 'glasshost1984',
  // },
];
