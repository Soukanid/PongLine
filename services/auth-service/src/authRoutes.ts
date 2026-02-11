import  { type FastifyInstance, type FastifyReply, type FastifyRequest }  from "fastify";
import { AuthService } from "./authService.ts";
import { LoginSchema, RegisterSchema, ValidateSchema } from "./authSchemas.ts";

export default async function authRoutes(fastify: FastifyInstance) {
    const authService = new AuthService(fastify.prisma, fastify)

    //register
    fastify.post('/register', {schema: RegisterSchema}, async (request: FastifyRequest, reply: FastifyReply)=>{
        try {
            const {email, username, password} = request.body as {
              email : string
              username : string
              password : string
            }
            const result = await authService.register(email,username,password)
            return result
        } catch (error: any) {
         reply.code(400).send({error: error.message})   
        }
    })
    
    //login
    fastify.post('/login', {schema: LoginSchema}, async (request, reply)=>{
        try {
            const {email, password, twoFactorCode} = request.body as {
              email : string
              password : string
              twoFactorCode : string
            }
            const result = await authService.login(email, password, twoFactorCode)
            return result
        } catch (error: any) {
            reply.code(401).send({error: error.message})
        }
    })
    
    // Validate token (for API Gateway)
  fastify.post('/validate', { schema: ValidateSchema }, async (request, reply) => {
    try {
      const { token } = request.body as {token: string}
      const result = await authService.validateToken(token)
      return result
    } catch (error: any) {
      return { valid: false, reason: 'validation_error' }
    }
  })
/*  
  // 2FA setup (for cybersecurity module)
  fastify.post('/2fa/setup', async (request, reply) => {
    try {
      // Extract token from header
      const token = fastify.auth.extractTokenFromHeader(request.headers.authorization)
      const payload = fastify.auth.verifyAccessToken(token)
      
      // Generate 2FA secret
      const secret = speakeasy.generateSecret({
        name: `ft_transcendence:${payload.email}`
      })
      
      // Store secret (but don't enable yet)
      await fastify.prisma.user.update({
        where: { id: payload.userId },
        data: { twoFactorSecret: secret.base32 }
      })
      
      return {
        secret: secret.base32,
        qrCodeUrl: secret.otpauth_url
      }
    } catch (error: any) {
      reply.code(401).send({ error: error.message })
    }
  })
  
  // Enable 2FA
  fastify.post('/2fa/enable', async (request, reply) => {
    try {
      const token = fastify.auth.extractTokenFromHeader(request.headers.authorization)
      const payload = fastify.auth.verifyAccessToken(token)
      const { code } = request.body
      
      const user = await fastify.prisma.user.findUnique({
        where: { id: payload.userId }
      })
      
      if (!user || !user.twoFactorSecret) {
        throw new Error('2FA not set up')
      }
      
      // Verify the code
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1
      })
      
      if (!isValid) {
        throw new Error('Invalid 2FA code')
      }
      
      // Enable 2FA
      await fastify.prisma.user.update({
        where: { id: payload.userId },
        data: { isTwoFactorEnabled: true }
      })
      
      return { success: true }
    } catch (error: any) {
      reply.code(400).send({ error: error.message })
    }
  })
    */
}