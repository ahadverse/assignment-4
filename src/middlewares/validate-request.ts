import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import { catchAsync } from "../utils/catch-async";

export const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }

      next();
    },
  );
};
