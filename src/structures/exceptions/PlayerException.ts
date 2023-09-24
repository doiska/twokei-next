export class PlayerException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlayerException";
  }
}
