import { execSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const authFile = resolve(__dirname, '.auth/user.json')
const dbPath = resolve(__dirname, '../../../../packages/database/local.db')

/**
 * Global Setup for E2E Tests
 * 
 * Strategy: Use an existing valid session from the database
 * and extract/set the exact cookie format that Better Auth expects.
 */

async function globalSetup() {
  console.log('Setting up test authentication...')
  
  try {
    // Get an existing valid session from the database
    const sessionResult = execSync(
      `sqlite3 "${dbPath}" "SELECT token, user_id FROM session ORDER BY expires_at DESC LIMIT 1;"`
    ).toString().trim()
    
    if (!sessionResult) {
      throw new Error('No valid session found in database')
    }
    
    const [token, userId] = sessionResult.split('|')
    console.log('Found existing session:', token.substring(0, 20) + '...')
    
    // Update session expiration to ensure it's valid
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = now + 7 * 24 * 60 * 60 // 7 days
    
    execSync(`sqlite3 "${dbPath}" "
      UPDATE session SET expires_at = ${expiresAt}, updated_at = ${now} 
      WHERE token = '${token}';
    "`)
    
    // Get user email for the session
    const userResult = execSync(
      `sqlite3 "${dbPath}" "SELECT email FROM user WHERE id = '${userId}';"`
    ).toString().trim()
    
    console.log('Session belongs to user:', userResult)
    
    // Better Auth with nextCookies() uses a specific cookie format
    // The cookie value is the raw session token (not signed for middleware check)
    // The middleware only checks presence, validation happens in Server Components
    const cookieObject = {
      name: 'better-auth.session_token',
      value: token, // Use raw token - middleware just checks existence
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax' as const,
      expires: expiresAt
    }
    
    // Save storage state file
    mkdirSync(resolve(__dirname, '.auth'), { recursive: true })
    writeFileSync(
      authFile,
      JSON.stringify({
        cookies: [cookieObject],
        origins: []
      }, null, 2)
    )
    
    console.log('Authentication setup complete')
    console.log('Cookie set with token:', token.substring(0, 20) + '...')
    
  } catch (error) {
    console.error('Failed to setup authentication:', error)
    // Create empty auth file to prevent errors
    mkdirSync(resolve(__dirname, '.auth'), { recursive: true })
    writeFileSync(
      authFile,
      JSON.stringify({ cookies: [], origins: [] }, null, 2)
    )
  }
}

export default globalSetup
