import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';

export default {
  [ErrorCodes.UNKNOWN]:
    'Sorry, an error occurred while trying to execute this command. Please try again later.',
  [ErrorCodes.SOMETHING_WENT_REALLY_WRONG]:
    'Something went really wrong, try contacting the developer.',
  [ErrorCodes.NOT_IN_VC]: 'You must be in a voice channel to use this command.',
  [ErrorCodes.NOT_SAME_VC]:
    'You must be in the same voice channel as me to use this command.',
  [ErrorCodes.NO_PLAYER_FOUND]:
    'There is no player in this server, use the `play` command to start playing music.',
  [ErrorCodes.MISSING_PERMISSIONS_JOIN_VC]:
    "I don't have the permissions to join the voice channel.",
  [ErrorCodes.PLAYER_MISSING_INPUT]: 'You must inform the name of the song.',
  [ErrorCodes.MISSING_MESSAGE]: [
    '**Due a `Discord` limitation, to use this channel you need to send a message mentioning the bot.**',
    'Please mention the bot and the song.',
    '',
    '**Example:** <{{- mention}}> https://music.youtube.com/watch?v=Ni5_Wrmh0f8',
    'Or click here {{- command_play}}',
  ],
};
