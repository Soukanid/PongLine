import { Type } from '@sinclair/typebox'

export const RegisterSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    username: Type.String({ minLength: 3, maxLength: 20 }),
    password: Type.String({ minLength: 6 })
  }),
  response: {
    200: Type.Object({
      token: Type.String()
      }),
    400: Type.Object({
      error: Type.String()
    })
  }
}

export const LoginSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String(),
    twoFactorCode: Type.Optional(Type.String())
  }),
  response: {
    200: Type.Object({
     token: Type.String()
    }),
    401: Type.Object({
      error: Type.String()
    })
  }
}

export const ValidateSchema = {
  headers: Type.Object({
    authorization: Type.String({
      pattern: '^Bearer .+$',
      description: 'Bearer token'
    })
  }),
  response: {
    200: Type.Object({
      valid: Type.Boolean(),
      reason: Type.Optional(Type.String())
    })
  }
}