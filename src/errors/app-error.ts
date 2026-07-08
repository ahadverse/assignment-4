export interface ErrorDetails {
  path: string | number;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorDetails: ErrorDetails[] | null;

  constructor(
    statusCode: number,
    message: string,
    errorDetails: ErrorDetails[] | null = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
