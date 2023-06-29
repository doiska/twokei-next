import { NodeOption, ShoukakuOptions } from "shoukaku";

type OptionWithActive = NodeOption & { active?: boolean };

export const Nodes: OptionWithActive[] = [
  {
    "name": "Amazon Eduardin",
    "url": "15.228.220.230:2333",
    "auth": "youshallnotpass",
    "secure": false
  },
  {
    "name": "lavalink.lexnet.cc",
    "url": "lavalink.lexnet.cc:443",
    "auth": "lexn3tl@val!nk",
    "secure": true
  },
  {
    "name": "eu-lavalink.lexnet.cc",
    "url": "eu-lavalink.lexnet.cc:443",
    "auth": "lexn3tl@val!nk",
    "secure": true
  },
  {
    "name": "https://open.spotify.com/track/4TuNI3WEMyLQAKRMJmcQdA",
    "url": "narco.buses.rocks:2269",
    "auth": "glasshost1984",
    "secure": false
  },
  {
    "name": "https://www.alexanderof.xyz",
    "url": "lavalink1.albinhakanson.se:1141",
    "auth": "albinhakanson.se",
    "secure": false
  },
  {
    "name": "https://sneakynodes.com/discord",
    "url": "lavalink.sneakynodes.com:2333",
    "auth": "sneakynodes.com",
    "secure": false
  },
  {
    "name": "https://discord.gg/ZNKNY3RpRg",
    "url": "server.alfari.id:6969",
    "auth": "youshallnotpass",
    "secure": false
  },
  {
    "name": "https://discord.gg/7G9TvNvZVs",
    "url": "my.tofumc.pro:25570",
    "auth": "sussy",
    "secure": false
  },
  {
    "name": "https://github.com/Dep0s1t",
    "url": "lavalink4africa.islantay.tk:8880",
    "auth": "AmeliaWatsonisTheBest**!",
    "secure": false
  },
  {
    "name": "https://horizxon.studio/",
    "url": "lava1.horizxon.studio:80",
    "auth": "horizxon.studio",
    "secure": false
  },
  {
    "name": "https://horizxon.studio/",
    "url": "lava3.horizxon.studio:80",
    "auth": "horizxon.studio",
    "secure": false
  },
  {
    "name": "https://horizxon.studio/",
    "url": "lava4.horizxon.studio:80",
    "auth": "horizxon.studio",
    "secure": false
  }
];

export const shoukakuOptions: ShoukakuOptions = {
  // resume: true,
  // resumeByLibrary: true
}
