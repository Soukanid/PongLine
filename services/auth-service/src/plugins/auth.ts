import jwt from 'jsonwebtoken'
import fp from 'fastify-plugin'
import { Type } from '@sinclair/typebox'
import fastify, { type FastifyInstance } from 'fastify'

export interface JWTPayload {
    userId: number
    role: string
    username: string
    iat: number
    exp: number
}

export const authPlugin = fp(async (fastify: FastifyInstance) => {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d"!;
  const JWT_GUEST_EXPIRY = process.env.JWT_GUEST_EXPIRY || "15m"!;

  //generate access token
  function generateToken(
    userId: number,
    role: string,
    username: string,
  ): string {
    if (role !== "warrior") {
      return jwt.sign({ userId, role, username }, JWT_SECRET, {
        expiresIn: JWT_GUEST_EXPIRY,
      } as jwt.SignOptions);
    }
    return jwt.sign({ userId, role, username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    } as jwt.SignOptions);
  }

  // Extract access token
  function extractToken(authHeader: string | undefined): string {
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new Error(
        "Invalid authorization header format. Expected: Bearer <token>",
      );
    }

    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  // Verify access token
  function verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  }

  //decorate fastify with auth utilities
  fastify.decorate("auth", {
    generateToken,
    verifyToken,
    extractToken,
  });
});

declare module "fastify" {
  interface FastifyInstance {
    auth: {
      generateToken: (
        userId: number,
        role: string,
        username: string,
      ) => string;
      verifyToken: (token: string) => JWTPayload;
      extractToken: (authHeader: string | undefined) => string;
    };
  }
}
