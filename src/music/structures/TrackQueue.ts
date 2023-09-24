import { type Maybe } from "@/utils/types-helper";
import { ResolvableTrack } from "./ResolvableTrack";
import { Track } from "@twokei/shoukaku";

export class TrackQueue extends Array<ResolvableTrack> {
  public current: Maybe<ResolvableTrack>;
  public previous: Maybe<ResolvableTrack>;

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

  get totalSize(): number {
    return this.length;
  }

  add(...item: ResolvableTrack[]): void {
    this.push(...item);
  }

  remove(item: ResolvableTrack | number): void {
    if (typeof item === "number") {
      this.removeAt(item);
    } else {
      const index = this.indexOf(item);
      if (index !== -1) {
        this.removeAt(index);
      }
    }
  }

  removeAt(index: number, count = 1): void {
    this.splice(index, count);
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  clear(): void {
    this.splice(0, this.length);
  }

  shuffle(): void {
    this.sort(() => Math.random() - 0.5);
  }
}
