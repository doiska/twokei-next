import { Maybe } from '../../utils/type-guards';
import { ResolvableTrack } from './ResolvableTrack';

export class TrackQueue<T = ResolvableTrack> extends Array<T> {

  public current: Maybe<T>;
  public previous: Maybe<T>;

  add(...item: T[]): void {
    this.push(...item);
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