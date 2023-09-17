export class FriendlyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FriendlyException";
  }
}
