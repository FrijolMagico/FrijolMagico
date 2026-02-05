import { betterAuth } from 'better-auth/minimal'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@frijolmagico/database/orm'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

const ALLOWED_DOMAIN = '@frijolmagico.cl'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite'
  }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
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
    expiresIn: 60 * 60 * 24 * 3, // 3 days
    updateAge: 60 * 60 * 24 // 24 hours
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
  plugins: [nextCookies()]
})
