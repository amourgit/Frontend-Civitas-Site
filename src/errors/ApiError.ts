import z from "zod";

// errors/ApiError.ts
  export class ValidationError extends Error {
    constructor(
      message: string,
      public issues: z.ZodIssue[],
      public endpoint?: string
    ) {
      super(message);
      this.name = 'ValidationError';
    }
  }
  
  export class NetworkError extends Error {
    constructor(
      message: string,
      public cause?: Error,
      public endpoint?: string
    ) {
      super(message);
      this.name = 'NetworkError';
    }
  }

  export class ApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public code?: string,
      public endpoint?: string
    ) {
      super(message);
      this.name = 'ApiError';
      Object.setPrototypeOf(this, ApiError.prototype);
    }
  
    toString(): string {
      return `${this.name}: ${this.message} (Status: ${this.status})`;
    }
  }