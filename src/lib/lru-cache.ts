export class LRUCache<T> extends Map<string, T> {
  private readonly maxSize: number;

  constructor(maxSize: number) {
    super();
    this.maxSize = maxSize;
  }

  set(key: string, value: T) {
    if (this.size >= this.maxSize) {
      this.delete(this.keys().next().value);
    }

    if (this.has(key)) {
      this.delete(key);
    }

    return super.set(key, value);
  }

  get(key: string): T | undefined {
    const item = super.get(key);

    if (item) {
      this.delete(key);
      this.set(key, item);
    }

    return item;
  }
}
