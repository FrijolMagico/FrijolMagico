export interface AuthUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AuthSession {
  id: string
  expiresAt: Date
  token: string
  userId: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  user: AuthUser
  session: AuthSession
}
