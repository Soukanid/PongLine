import jwt from 'jsonwebtoken'
import fp from 'fastify-plugin'
import { Type } from '@sinclair/typebox'
import fastify, { type FastifyInstance } from 'fastify'

export interface JWTPayload {
    userId: string
    email: string
    username: string
    iat: number
    exp: number
}

export const authPlugin = fp(async (fastify: FastifyInstance)=>{
    const JWT_SECRET = process.env.JWT_SECRET!
    const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'!
    
    //generate access token
    function generateToken(userId: string, email:string, username:string):string{
        return jwt.sign(
            {userId, email, username},
            JWT_SECRET,
            {expiresIn: JWT_EXPIRY} as jwt.SignOptions
        )
    }

     // Verify access token
  function verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  }

    //decorate fastify with auth utilities
    fastify.decorate('auth',{
        generateToken,
        verifyToken,
    })
})

declare module 'fastify' {
    interface FastifyInstance {
        auth: {
            generateToken: (userId:string, email:string,username:string)=>string
            verifyToken: (token: string) => JWTPayload
        }
    }
}