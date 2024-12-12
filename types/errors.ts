export class GameServiceError extends Error {
    constructor(message: string, public _originalError?: unknown) {
      super(message);
      this.name = 'GameServiceError';
    }
  }