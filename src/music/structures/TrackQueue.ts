import { type Maybe } from "@/utils/types-helper";
import { ResolvableTrack } from "./ResolvableTrack";
import { Track } from "@twokei/shoukaku";

export class TrackQueue extends Array<ResolvableTrack> {
  public current: Maybe<ResolvableTrack>;
  public previous: Maybe<ResolvableTrack>;

  public unShuffled = new Array<ResolvableTrack>();

  get totalSize(): number {
    return this.length;
  }

  add(...item: ResolvableTrack[]): void {
    this.push(...item);
  }

  shuffle(): void {
    this.unShuffled = [...this];
    this.sort(() => Math.random() - 0.5);
  }

  public restore(dump?: ReturnType<(typeof this)["dump"]>) {
    if (!dump) {
      return;
    }

    if (dump.current) {
      this.current = ResolvableTrack.from(dump.current as Track);
    }

    if (dump.previous) {
      this.previous = ResolvableTrack.from(dump.previous as Track);
    }

    if (dump.queue && Array.isArray(dump.queue) && dump.queue.length > 0) {
      this.unshift(
        ...dump.queue.map((track) => ResolvableTrack.from(track.track)),
      );
    }
  }

  public dump() {
    return {
      current: this.current?.getRaw() ?? null,
      previous: this.previous?.getRaw() ?? null,
      queue: this.map((track) => ({ track: track.getRaw() })),
    };
  }
}
