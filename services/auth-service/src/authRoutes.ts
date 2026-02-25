import  { type FastifyInstance, type FastifyReply, type FastifyRequest }  from "fastify";
import { AuthService } from "./authService.ts";
import { LoginSchema, RegisterSchema, ValidateSchema } from "./authSchemas.ts";
import * as speakeasy from 'speakeasy' 

export default async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService(fastify.prisma, fastify);

  //guest
  fastify.post(
    "/guest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { alias } = request.body as { alias: string };

        const accessToken = await authService.guestRegister(alias);

        reply.setCookie("access_token", accessToken, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 86400,
        });

        return reply.send({ success: "Login successful" });
      } catch (error) {
        if (error instanceof Error) return reply.send({ error: error.message });
        return reply.code(400).send({ error: "something's wrong" });
      }
    },
  );
  //register
  fastify.post(
    "/register",
    { schema: RegisterSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, username, password } = request.body as {
            email: string;
            username: string;
            password: string;
          };

        await authService.register(email, username, password);
        return reply.code(201).send({ success: "Account created successfully" });
      } catch (error: any) {
        if (error instanceof Error) return reply.send({ error: error.message });
        return reply.code(400).send({ error: error.message });
      }
    },
  );

  //login
  fastify.post(
    "/login",
    { schema: LoginSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { email, password } = request.body as {
          email: string;
          password: string;
        };
        const result = await authService.login(email, password);

        reply.setCookie(result.type, result.token, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 86400,
        });

        if (result.type === "tfa_token") {
          return reply.code(200).send({ success: "2FA enabled", tfa: true });
        }
        
        return reply.code(200).send({ success: "Login successful", tfa:false });
      } catch (error: any) {
        if (error instanceof Error) return reply.send({ error: error.message });
        else return reply.code(404).send({ error: error.message });
      }
    },
  );

  fastify.get(
    "/validate",
    { schema: ValidateSchema },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = request.cookies?.access_token;
        if (!token) return reply.code(401).send();

        const result = await authService.validateToken(token);
        if (!result.valid) {
          return reply.code(401).send(result);
        }
        reply.header("X-User-Id", result.user?.id);
        reply.header("X-User-Username", result.user?.username);
        reply.header("X-User-Alias", result.user?.username);
        reply.header("X-User-Role", result.user?.role);

        return result;
      } catch (error: any) {
        if (error instanceof Error) return reply.send({ error: error.message });
        return { valid: false, reason: "validation_error" };
      }
    },
  );

  fastify.post(
    "/change-password",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = request.cookies?.access_token;
        if (!token) return reply.code(401).send();

        const result = await authService.validateToken(token);
        if (!result.valid) {
          return reply.code(401).send(result);
        }
 
        const userId = result.user?.id;
        const { currentPassword, newPassword } = request.body as {
          currentPassword?: string;
          newPassword?: string;
        };

        if (!currentPassword || !newPassword)
          return reply.code(400).send();

        await authService.changePassword(userId, currentPassword, newPassword);

        return reply.code(200).send({ success: "Password updated successfully" });

      } catch (error: any) {
        if (error instanceof Error) reply.send({ error: error.message });
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.post(
    "/change-username",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = request.cookies?.access_token;
        if (!token)
          return reply.code(401).send({ error: "Unauthorized" });
        const userId = request.headers['x-user-id']?.toString();
        const myUsername = request.headers['x-user-username']?.toString();
    
        if (!userId || !myUsername)
          return reply.code(401).send();

        const myId = parseInt(userId);
        const { newUsername } = request.body as { newUsername: string };

        if (!newUsername || newUsername.trim() === '')
          return reply.code(400).send();

        const trimmedUsername = newUsername.trim();

        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        if (!usernameRegex.test(trimmedUsername))
            return reply.code(400).send({ error: "Username is Invalid"});

        const existingUser = await fastify.prisma.userAuth.findUnique({
          where: { username: trimmedUsername },
        });

        if (existingUser)
        {
          if (existingUser.username === myUsername)
            return reply.code(200).send();
          return reply.code(409).send({ error: "Username is already taken" });
        }

        await fastify.prisma.userAuth.update({
          where: { username: myUsername }, 
          data: { username: trimmedUsername },
        });

        const newAccessToken = fastify.auth.generateToken(
          myId,
          "warrior",
          trimmedUsername
        );

        reply.setCookie("access_token", newAccessToken, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 86400, //[soukaina] should be changed
        });

        return reply.code(200).send({ 
          success: "true", 
        });

      } catch (error: any) {
        if (error instanceof Error) return reply.send({ error: error.message });
        return reply.code(500).send({ error: "Failed to Update the Username" });
      }
    },
  );

  // get 42 authorization
  fastify.get(
    "/42/login",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const params = new URLSearchParams({
        client_id: process.env.INTRA_ID!,
        redirect_uri: process.env.VITE_API_GATEWAY_URL + "api/auth/42/callback",
        response_type: "code",
        scope: "public",
      });

      const authUrl = `https://api.intra.42.fr/oauth/authorize?${params.toString()}`;

      return reply.redirect(authUrl);
    },
  );

  // get 42 access_token and authenticate
  fastify.get(
    "/42/callback",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { code } = request.query as { code: string };

      if (!code) {
        return reply.status(400).send({ error: "Missing authorization code" });
      }

      try {
        const params = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.INTRA_ID!,
          client_secret: process.env.INTRA_SECRET!,
          code,
          redirect_uri: process.env.VITE_API_GATEWAY_URL + "api/auth/42/callback",
        });

        var Response = await fetch(
          `https://api.intra.42.fr/oauth/token?${params.toString()}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );

        if (Response.ok!)
          return reply.code(401).send({error: Response.json()})

        const tokenResponse = await Response.json();
        const intraToken = tokenResponse.access_token;

        Response = await fetch("https://api.intra.42.fr/v2/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${intraToken}`,
          },
        });

        if (Response.ok!)
          return reply.code(401).send({error: Response.json()})

 
        const user = await Response.json();
        var authUser = await fastify.prisma.userAuth.findUnique({
          where: { username: user.login },
        });

        if (!authUser) {
          await authService.register(user.email, user.login, " ");
        }

        authUser = await fastify.prisma.userAuth.findUnique({
          where: { username: user.login },
        });

        if (!authUser) {
          throw new Error("something went wrong");
        }
        const accessToken = fastify.auth.generateToken(
          Number(authUser.userId),
          "warrior",
          authUser.username,
        );

        reply.setCookie("access_token", accessToken, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 86400,
        });

        return reply.redirect(process.env.VITE_API_GATEWAY_URL + "dashboard");
      } catch (error: any) {
        console.error("42 OAuth error:", error.response?.data || error);
        if (error instanceof Error) return reply.send({ error: error.message });
        return reply.status(500).send({ error: error.response?.data });
      }
    },
  );

  // 2FA setup (for cybersecurity module)
  fastify.post(
    "/2fa/setup",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Extract token from header
        const username = Array.isArray(request.headers["x-user-username"])
          ? request.headers["x-user-username"][0]
          : request.headers["x-user-username"];
        if (!username) {
          return reply.status(400).send({ error: "X-User-Id header missing" });
        }

        // Generate 2FA secret
        const secret = speakeasy.generateSecret({
          name: `Pongline:${username}`,
          length: 20,
        }).base32;

        // Store secret (but don't enable yet)
        await fastify.prisma.userAuth.update({
          where: { username },
          data: { TFASecret: secret },
        });

        return {
          qrCodeUrl: secret.otpauth_url,
        };
      } catch (error: any) {
        if (error instanceof Error) return reply.send({ error: error.message });
        return reply.code(401).send({ error: error.message });
      }
    },
  );

  // Enable 2FA
  fastify.post(
    "/2fa/enable",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Extract token from header
        const username = Array.isArray(request.headers["x-user-username"])
          ? request.headers["x-user-username"][0]
          : request.headers["x-user-username"];
        if (!username) {
          return reply.status(400).send({ error: "X-User-Id header missing" });
        }

        const { code } = request.body as {code: number};

        const user = await fastify.prisma.userAuth.findUnique({
          where: { username },
          select: {
            isTFAEnabled: true,
            TFASecret: true,
          },
        });

        if (!user || !user.TFASecret) {
          throw new Error("2FA not set up");
        }

        // Verify the code
        const isValid = speakeasy.totp.verify({
          secret: user.TFASecret,
          encoding: "base32",
          token: code,
          window: 1,
        });

        if (!isValid) {
          throw new Error("Invalid 2FA code");
        }

        // Enable 2FA
        await fastify.prisma.userAuth.update({
          where: { username },
          data: { isTFAEnabled: true },
        });

        return { success: true };
      } catch (error: any) {
        if (error instanceof Error) return reply.send({ error: error.message });
        return reply.code(400).send({ error: error.message });
      }
    },
  );

  fastify.post(
    "/2fa/validate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = request.cookies?.tfa_token;
        if (!token) return reply.code(401).send({ error: "2FA token missing" });

        const { tfacode } = request.body as {
          tfacode: string;
        };

        const result = await authService.validateTFA(tfacode, token);

        reply.setCookie("access_token", result.token, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 86400,
        });

        reply.clearCookie("tfa_token", {
          path: "/",
          sameSite: "strict",
        });

        return reply.send({ success: true });
      } catch (error: any) {
        if (error instanceof Error) return reply.send({ error: error.message });
        return reply.code(401).send({ error: error.message });
      }
    },
  );
fastify.delete(
    "/delete",
  async (request: FastifyRequest, reply: FastifyReply)=>{
    try {

      const token = request.cookies?.access_token;
        if (!token)
          return reply.code(400).send({ error: "access token missing" });

        const result = await authService.validateToken(token);
        if (!result.valid) {
          return reply.code(401).send(result);
        }
        if(result.user?.username)
          await authService.deleteUser(result.user?.username);

      reply.clearCookie("access_token", {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      return reply.code(204).send();
      } catch (error: any) {
        if (error instanceof Error) return reply.send({ error: error.message });
        return reply.code(401).send({ error: error.message });
      }
  })
   
  fastify.post(
    "/logout",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = request.cookies?.access_token;
        if (!token)
          return reply.code(400).send({ error: "access token missing" });

        const result = await authService.validateToken(token);
        if (!result.valid) {
          reply.clearCookie("access_token", {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
          return reply.code(401).send(result);
        }

        if (result.user?.role === 'guest')
        {
          await authService.deleteUser(result.user?.username);
        }
        reply.clearCookie("access_token", {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });

        return reply.send({ success: true });
      } catch (error: any) {
        if (error instanceof Error) return reply.send({ error: error.message });
        return reply.code(401).send({ error: error.message });
      }
    },
  );
}
