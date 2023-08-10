import { NodeOption, ShoukakuOptions } from "shoukaku";

type OptionWithActive = NodeOption & { active?: boolean };

export const Nodes: OptionWithActive[] = [
  {
    "name": "Amazon Eduardin",
    "url": "15.228.220.230:2333",
    "auth": "youshallnotpass",
    "secure": false
  }
  // {
  //   "name": "lavalink.lexnet.cc",
  //   "url": "lavalink.lexnet.cc:443",
  //   "auth": "lexn3tl@val!nk",
  //   "secure": true
  // },
  // {
  //   "name": "eu-lavalink.lexnet.cc",
  //   "url": "eu-lavalink.lexnet.cc:443",
  //   "auth": "lexn3tl@val!nk",
  //   "secure": true
  // },
  // {
  //   "name": "https://horizxon.studio/",
  //   "url": "lava1.horizxon.studio:80",
  //   "auth": "horizxon.studio",
  //   "secure": false
  // },
  // {
  //   "name": "https://horizxon.studio/",
  //   "url": "lava3.horizxon.studio:80",
  //   "auth": "horizxon.studio",
  //   "secure": false
  // },
  // {
  //   "name": "https://horizxon.studio/",
  //   "url": "lava4.horizxon.studio:80",
  //   "auth": "horizxon.studio",
  //   "secure": false
  // }
];

export const shoukakuOptions: ShoukakuOptions = {
  moveOnDisconnect: true,
  // resume: true,
  // resumeByLibrary: true
}
