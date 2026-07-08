import { Response } from "express";

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ResponsePayload<T> {
  statusCode?: number;
  success?: boolean;
  message: string;
  data?: T;
  meta?: Meta;
}

export const sendResponse = <T>(res: Response, payload: ResponsePayload<T>) => {
  const statusCode = payload.statusCode ?? 200;

  res.status(statusCode).json({
    success: payload.success ?? true,
    message: payload.message,
    ...(payload.meta ? { meta: payload.meta } : {}),
    data: payload.data ?? null,
  });
};
