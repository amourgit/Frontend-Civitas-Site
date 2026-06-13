export class NetworkError extends Error {
    constructor(
      message: string,
      public cause?: Error,
      public endpoint?: string
    ) {
      super(message);
      this.name = 'NetworkError';
      Object.setPrototypeOf(this, NetworkError.prototype);
    }
  
    toString(): string {
      const causeMessage = this.cause ? ` (Caused by: ${this.cause.message})` : '';
      return `${this.name}: ${this.message}${causeMessage}`;
    }
  }