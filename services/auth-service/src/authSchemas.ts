import { Type } from '@sinclair/typebox'

export const RegisterSchema = {
  body: Type.Object({
    email: Type.String({ format: 'email' }),
    username: Type.String({ minLength: 3, maxLength: 20 }),
    password: Type.String({ minLength: 6 })
  }),
  response: {
    200: Type.Object({
      tokens: Type.Object({
        accessToken: Type.String()
      })
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
     tokens: Type.Object({
        accessToken: Type.String()
      })
    }),
    401: Type.Object({
      error: Type.String()
    })
  }
}

export const ValidateSchema = {
  body: Type.Object({
    token: Type.String()
  }),
  response: {
    200: Type.Object({
      valid: Type.Boolean(),
      user: Type.Optional(Type.Object({
        id: Type.String(),
        email: Type.String(),
        username: Type.String()
      })),
      reason: Type.Optional(Type.String())
    })
  }
}