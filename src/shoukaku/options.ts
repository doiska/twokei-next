import { NodeOption, ShoukakuOptions } from "shoukaku";

export const Nodes: NodeOption[] = [
  {
    name: "freelava.ga",
    url: 'node1.kartadharta.xyz:443',
    secure: true,
    auth: "kdlavalink",
  },
  {
    name: "lavalink.oops.wtf",
    url: 'lavalink.oops.wtf',
    secure: true,
    auth: "www.freelavalink.ga"
  }
];

export const shoukakuOptions: ShoukakuOptions = {
  resume: true,
  resumeByLibrary: true,
}