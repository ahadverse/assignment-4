import { AppError } from "./app-error";

export class NotFoundError extends AppError {
  constructor(message = "Resuorce not found") {
    super(404, message);
  }
}
