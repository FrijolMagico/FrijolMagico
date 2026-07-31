import { betterAuth } from 'better-auth/minimal'
import { dash } from '@better-auth/infra'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@frijolmagico/database/orm'
import {
  ALLOWED_DOMAIN,
  SESSION_EXPIRATION_TIME,
  SESSION_UPDATE_AGE
} from './config'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  appName: 'Panel de Administración - Frijol Mágico',
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['x-vercel-forwarded-for', 'x-forwarded-for']
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }
  },
  emailAndPassword: {
    enabled: false
  },
  session: {
    expiresIn: SESSION_EXPIRATION_TIME,
    updateAge: SESSION_UPDATE_AGE,
    cookieCache: {
      enabled: true,
      maxAge: SESSION_EXPIRATION_TIME,
      strategy: 'jwe'
    }
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path?.includes('/sign-in/social')) return

      const user = ctx.context?.user

      if (user?.email && !user.email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
        throw new APIError('FORBIDDEN', {
          message: `Solo se permiten correos de dominio ${ALLOWED_DOMAIN}`
        })
      }
    })
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3001'],
  plugins: [dash(), nextCookies()]
})
