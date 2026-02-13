import bcrypt from "bcryptjs";
import { type PrismaClient } from "@prisma/client";
import { type FastifyInstance } from "fastify";
//import * as speakeasy from 'speakeasy' 2FA

export class AuthService {
  private prisma: PrismaClient;
  private fastify: FastifyInstance;

  constructor(prisma: PrismaClient, fastify: FastifyInstance) {
    this.prisma = prisma;
    this.fastify = fastify;
  }

  private readonly SALT_ROUNDS = 10;
  private readonly USER_SERVICE_URL = process.env.USER_SERVICE_URL;

  //helper method to call User Service
  private async callUserService<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    data?: unknown,
  ): Promise<T> {
    const url = `${this.USER_SERVICE_URL}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Request": "true",
        "X-Service-Name": "auth-service",
      },
      body: JSON.stringify(data),
    });

    let parsedPayload: unknown;

    try {
      parsedPayload = await response.json();
    } catch {
      throw new Error("invalid JSON response from user service");
    }

    if (!response.ok) {
      const errorMessage =
        (parsedPayload as any)?.error || response.statusText || "Unknown error";
      throw new Error(`User service error: ${errorMessage}`);
    }
    return parsedPayload as T;
  }

  //register
  async register(email: string, username: string, password: string) {
    //check if user exists
    const existingUser = await this.prisma.userAuth.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      throw new Error("email or username already exists");
    }

    //hash  password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    try {
      //create user in User service
      const user = await this.callUserService<{
        id: number;
      }>("POST", "create_user", { email, username });

      //create user in Auth service
      await this.prisma.userAuth.create({
        data: {
          email,
          username,
          passwordHash,
          userId: user.id,
          createdAt: new Date(),
        },
      });

      //generate token
      const accessToken = this.fastify.auth.generateToken(
        user.id,
        'warior',
        username,
      );

      return { token: accessToken };
    } catch (error: any) {
      await this.prisma.userAuth
        .deleteMany({
          where: { email },
        })
        .catch(() => {});
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  //login controller
  async login(email: string, password: string, twoFactorCode?: string) {
    // 1. Find user in Auth DB
    const authUser = await this.prisma.userAuth.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        userId: true,
      },
    });

    if (!authUser) {
      throw new Error("Invalid credentials");
    }

    // 2. Verify password
    const isValidPassword = await bcrypt.compare(
      password,
      authUser.passwordHash,
    );

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }
    /* 
    // 3. Check 2FA if enabled
    if (authUser.isTwoFactorEnabled && authUser.twoFactorSecret) {
      if (!twoFactorCode) {
        throw new Error('2FA code required')
      }
      
      const isValid2FA = speakeasy.totp.verify({
        secret: authUser.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1
      })
      
      if (!isValid2FA) {
        throw new Error('Invalid 2FA code')
      }
    }
    */

    // 6. Generate token
    const accessToken = this.fastify.auth.generateToken(
      authUser.userId,
      'warrior',
      authUser.username,
    );

    return { token: accessToken };
  }

  //validate token controller
  async validateToken(AuthHeader: string | undefined) {
    try {
      const accessToken = this.fastify.auth.extractToken(AuthHeader);
      const payload = this.fastify.auth.verifyToken(accessToken);

      // Check if auth user still exists
      const authUser = await this.prisma.userAuth.findUnique({
        where: { username: payload.username },
        select: {
          userId: true,
          username: true,
        },
      });

      if (!authUser) {
        return { valid: false, reason: "user_not_found" };
      }

      return {
        valid: true,
        user: {
          id: authUser.userId,
          role: 'warrior',
          username: authUser.username,
          alias: authUser.username,
        },
      };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return { valid: false, reason: "token_expired" };
      }
      return { valid: false, reason: "invalid_token" };
    }
  }
}
