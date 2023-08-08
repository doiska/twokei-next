import { NodeOption, ShoukakuOptions } from "shoukaku";

type OptionWithActive = NodeOption & { active?: boolean };

export const Nodes: OptionWithActive[] = [
  {
    "name": "Amazon Eduardin",
    "url": "15.228.220.230:2333",
    "auth": "youshallnotpass",
    "secure": false
  }
];

export const shoukakuOptions: ShoukakuOptions = {
  // resume: true,
  // resumeByLibrary: true
}
