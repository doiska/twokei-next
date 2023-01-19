import { Maybe } from "../utils/utils.types";
import { Venti } from '../music/Venti';
import { Events } from '../music/interfaces/player.types';
import { Track } from 'shoukaku';

export class ExtendedQueue<T> extends Array<T> {

  private readonly venti: Venti;

  public current: Maybe<T>;
  public previous: Maybe<T>;

  constructor(venti: Venti, ...items: T[]) {
    super(...items);

    this.venti = venti;
  }

  add(...item: T[]): void {
    this.push(...item);

    if(this.length !== 1) {
      this.venti.emit(Events.TrackAdd, this.venti, item as Track[]);
    }
  }

  remove(item: T | number): void {
    if (typeof item === 'number') {
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

  get(index: number): T | undefined {
    return this.at(index);
  }

  get totalSize(): number {
    return this.length;
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