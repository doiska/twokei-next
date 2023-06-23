import { NodeOption, ShoukakuOptions } from 'shoukaku';

type OptionWithActive = NodeOption & { active?: boolean };

export const Nodes: OptionWithActive[] = [
  {
    name: 'lava1.horizxon.studio:80',
    url: 'lava1.horizxon.studio',
    secure: false,
    auth: 'horizxon.studio'
  },
  {
    name: 'lava3.horizxon.studio:80',
    url: 'lava3.horizxon.studio',
    secure: false,
    auth: 'horizxon.studio'
  },
  {
    name: 'lava4.horizxon.studio:80',
    url: 'lava4.horizxon.studio',
    secure: false,
    auth: 'horizxon.studio'
  },
  {
    name: 'narco.buses.rocks:2269',
    url: 'narco.buses.rocks',
    secure: true,
    auth: 'glasshost1984',
  },
];

export const shoukakuOptions: ShoukakuOptions = {
  resume: true,
  resumeByLibrary: true
};