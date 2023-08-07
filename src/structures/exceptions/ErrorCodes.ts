export const RawErrorCodes = {
  UNKNOWN: 'unknown',
  NOT_IN_VC: 'not-in-vc',
  NOT_SAME_VC: 'not-same-vc',
  NO_PLAYER_FOUND: 'no-player-found',
  MISSING_PERMISSIONS_JOIN_VC: 'missing-permissions-join-vc',
  MISSING_ADMIN_PERMISSIONS: 'missing-admin-permissions',
  SOMETHING_WENT_REALLY_WRONG: 'something-went-really-wrong',
  PLAYER_MISSING_INPUT: 'player-missing-input',
  PLAYER_NO_TRACKS_FOUND: 'player-no-tracks-found',
  MISSING_MESSAGE: 'missing-message',
  MISSING_SONG_CHANNEL: 'missing-song-channel',
  USE_SONG_CHANNEL: 'use-song-channel',
};

type CodeKey = keyof typeof RawErrorCodes;

export const ErrorCodes = Object.entries(RawErrorCodes)
  .reduce(
    (acc, [key, value]) => ({ ...acc, [key]: `error:${value}` }),
    {},
  ) as Record<CodeKey, string>;
