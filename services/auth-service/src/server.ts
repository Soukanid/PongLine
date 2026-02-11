import Fastify from 'fastify'
import {type TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'

export const fastify = Fastify({
    bodyLimit: 1048576
}).withTypeProvider<TypeBoxTypeProvider>()

fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})

fastify.register(helmet, {
    contentSecurityPolicy: {
        directives: {
            defaultSrc:["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"]
        }
    }
})