import i18next from 'i18next';
import { APIApplicationCommandOptionChoice } from 'discord.js';
import { LoopStates } from '../music/controllers/Venti';
import { CommandContext, createCommand } from 'twokei-framework';
import { setLoopState } from '../music/heizou/set-loop-state';
import { getReadableException } from '../exceptions/utils/get-readable-exception';

const execute = async (context: CommandContext<{ state?: keyof typeof LoopStates }>) => {
  const { guild, input: { state } } = context;

  if (!guild) {
    return i18next.t('player.commands.loop.no-guild', { ns: 'player' });
  }

  return setLoopState(guild, state ? LoopStates[state] : undefined)
    .then((newState) => i18next.t('player.commands.loop.success', { ns: 'player', loop: newState }))
    .catch(getReadableException);
}

export const loopCommand = createCommand({
  name: 'loop',
  description: 'Loop the current song or the queue',
  slash: (builder) => {

    const choices: APIApplicationCommandOptionChoice<string>[] = [
      {
        name: 'None',
        value: 'none'
      },
      {
        name: 'Track',
        value: 'track'
      },
      {
        name: 'Queue',
        value: 'queue'
      }
    ]

    return builder
      .addStringOption(option => (
          option.setName('state')
            .setDescription('The type of loop')
            .setRequired(false)
            .addChoices(...choices)
        )
      )
  }
}, execute);