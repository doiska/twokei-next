import { ExtendedPlayer } from "../../structures/ExtendedPlayer";

type Events = 'start' | 'stuck' | 'update' | 'end' | 'error' | 'closed' | 'exception';

export const registerPlayerEvents = (player: ExtendedPlayer) => {
  const _events: Record<Events, (player: ExtendedPlayer) => void> = {
    start: handleStartEvent,
    stuck: handleStuckEvent,
    update: handleUpdateEvent,
    error: () => {},
    end: () => {},
    closed: () => {},
    exception: () => {},
  } as const;

  Object.entries(_events).forEach(([event, handler]) => {
    player.on(event as any, () => handler(player));
  });
}

const handleStartEvent = (player: ExtendedPlayer) => {

}

const handleStuckEvent = (player: ExtendedPlayer) => {

}

const handleUpdateEvent = (player: ExtendedPlayer) => {

}

const handleErrorEvent = (player: ExtendedPlayer) => {

}