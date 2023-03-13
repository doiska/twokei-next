import { NodeOption, ShoukakuOptions } from "shoukaku";

type OptionWithActive = NodeOption & { active?: boolean };

export const Nodes: OptionWithActive[] = [
  {
    name: "freelava.ga",
    url: 'node1.kartadharta.xyz:443',
    secure: true,
    auth: "kdlavalink",
    active: true
  },
  {
    name: "lavalink.oops.wtf",
    url: 'lavalink.oops.wtf',
    secure: true,
    auth: "www.freelavalink.ga",
    active: true
  }
].filter(i => i.active);

export const shoukakuOptions: ShoukakuOptions = {
  resume: true,
  resumeByLibrary: true,
}