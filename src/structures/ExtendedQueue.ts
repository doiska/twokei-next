export class ExtendedQueue<T> {

  private _entries = new Array<T>();

  add(...item: T[]): void {
    this._entries.push(...item);
  }

  remove(item: T | number): void {
    this._entries = this._entries.filter(i => i !== item);
  }

  removeAt(index: number, count = 1): void {
    this._entries.splice(index, count);
  }

  get(index: number): T | undefined {
    return this._entries[index];
  }

  get size(): number {
    return this._entries.length;
  }

  first(): T | undefined {
    return this._entries.shift();
  }

  last(): T | undefined {
    return this._entries?.[this.size - 1];
  }

  isEmpty(): boolean {
    return this._entries.length === 0;
  }

  clear(): void {
    this._entries = [];
  }

  shuffle(): void {
    this._entries.sort(() => Math.random() - 0.5);
  }

  entries(): T[] {
    return this._entries;
  }
}