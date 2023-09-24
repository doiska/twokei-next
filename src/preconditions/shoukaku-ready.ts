import {
  container,
  Precondition,
  Result,
  UserError,
} from "@sapphire/framework";

export const isShoukakuReady = () => {
  return !!(
    container.xiao &&
    container.xiao.shoukaku.id &&
    container.xiao.shoukaku.reconnectingPlayers.size <= 0
  );
};

export class ShoukakuReady extends Precondition {
  public override async messageRun(): Promise<Result<unknown, UserError>> {
    if (!isShoukakuReady()) {
      return this.error({
        message: "Wait a few seconds for me to connect to the voice channel.",
      });
    }

    return this.ok();
  }
}
