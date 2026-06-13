import { z } from 'zod';

export class ValidationError extends Error {
  constructor(
    message: string,
    public issues: z.ZodIssue[],
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  getFormattedIssues(): string[] {
    return this.issues.map(issue => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
      return `${path}: ${issue.message}`;
    });
  }

  toString(): string {
    const formattedIssues = this.getFormattedIssues().join(', ');
    return `${this.name}: ${this.message}. Issues: ${formattedIssues}`;
  }
}