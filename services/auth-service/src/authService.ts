import bcrypt from "bcryptjs";
import { type PrismaClient } from "@prisma/client";
import { type FastifyInstance } from "fastify";
import * as speakeasy from 'speakeasy' 

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
    token: string,
    data?: unknown,
  ): Promise<T> {
    const url = `${this.USER_SERVICE_URL}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Request": "true",
        "X-Service-Name": "auth-service",
        "Cookie": `access_token=${token}`,
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
      //generate temp token
      const tempToken = this.fastify.auth.generateToken(0, "warrior", username);

      //create user in User service
      const user = await this.callUserService<{ id: number }>(
        "POST",
        "create_user",
        tempToken,
        { email, username },
      );

      //create user in Auth service
      await this.prisma.userAuth.create({
        data: {
          email,
          username,
          passwordHash,
          userId: Number(user.id),
          createdAt: new Date(),
        },
      });

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
  async login(email: string, password: string) {
    // 1. Find user in Auth DB
    const authUser = await this.prisma.userAuth.findUnique({
      where: { email },
      select: {
        userId: true,
        username: true,
        passwordHash: true,
        isTFAEnabled: true,
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

    // 3. Check 2FA if enabled
    if (authUser.isTFAEnabled) {
      // Generate 2FA temp token
      const TFAToken = this.fastify.auth.generateToken(
        Number(authUser.userId),
        "warrior",
        authUser.username,
      );
      return { type: 'tfa_token',token: TFAToken };
    }
    // 6. Generate token
    const accessToken = this.fastify.auth.generateToken(
      Number(authUser.userId),
      "warrior",
      authUser.username,
    );

      //update users online status in User service
    await this.callUserService<{}>(
        "POST",
        "online",
        accessToken,
        { id: authUser.userId, isOnline: true },
      );

    return { type: 'access_token',token: accessToken };
  }

  // validate 2FA
  async validateTFA(twoFactorCode: string, tfa_token: string) {

     const payload = this.fastify.auth.verifyToken(tfa_token);

     // Check if auth user still exists
     const authUser = await this.prisma.userAuth.findUnique({
       where: { username: payload.username },
       select: {
         userId: true,
         username: true,
         isTFAEnabled: true,
         TFASecret: true,
       },
     });

     if (!authUser || !authUser.isTFAEnabled) {
       throw new Error("Invalid credentials or 2FA not enabled");
     }

     if (!authUser.TFASecret) {
       throw new Error("2FA not setup");
     }

     if (!twoFactorCode) {
       throw new Error("2FA code required");
     }

     const isValid2FA = speakeasy.totp.verify({
       secret: authUser.TFASecret,
       encoding: "base32",
       token: twoFactorCode,
       window: 1,
     });

     if (!isValid2FA) {
       throw new Error("Invalid 2FA code");
     }

     const accessToken = this.fastify.auth.generateToken(
       Number(authUser.userId),
       "warrior",
       authUser.username,
     );
//update users online status in User service
      await this.callUserService<{}>(
        "POST",
        "online",
        accessToken,
        { id: authUser.userId, isOnline: true },
      );
     return {token: accessToken };
  }

  //validate token controller

  async validateToken(token: string) {
    try {
      const payload = this.fastify.auth.verifyToken(token);

      if (payload.role === 'guest')
      {
        return {
          valid: true,
          user: {
            id: payload.userId,
            role: "guest",
            alias: payload.username,
            username: "",
          },
        };
      }
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
          role: "warrior",
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
