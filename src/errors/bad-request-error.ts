import { AppError, ErrorDetail } from './app-error';

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errorDetails: ErrorDetail[] | null = null) {
    super(400, message, errorDetails);
  }
}
