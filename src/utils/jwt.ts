import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { config } from "../config";

export interface JwtPayload {
  userId: string;
  role: Role;
}

export const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwt.secret as Secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret as Secret) as JwtPayload;
};
