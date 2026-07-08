import { AppError, ErrorDetails } from './app-error';

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errorDetails: ErrorDetails[] | null = null) {
    super(400, message, errorDetails);
  }
}
