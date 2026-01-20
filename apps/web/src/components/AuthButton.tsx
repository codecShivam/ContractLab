/**
 * Authentication Button Component
 * 
 * Shows:
 * - Login buttons (Google/GitHub) when logged out
 * - User profile + logout when logged in
 * 
 * Uses Auth.js endpoints from the API
 */

import { useState, useEffect } from 'react'
import { Loader2, LogOut } from 'lucide-react'
import theme from '../theme'

/**
 * User type from Auth.js
 */
interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface Session {
  user: User
  expires: string
}

const API_URL = import.meta.env.VITE_API_URL?.replace('/trpc', '') || 'http://localhost:4000'

export function AuthButton() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [csrfToken, setCsrfToken] = useState<string>('')

  /**
   * Check if user is logged in on mount and get CSRF token
   */
  useEffect(() => {
    checkSession()
    getCsrfToken()
  }, [])

  /**
   * Fetch CSRF token for form submissions
   */
  async function getCsrfToken() {
    try {
      const response = await fetch(`${API_URL}/api/auth/csrf`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setCsrfToken(data.csrfToken || '')
      }
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
    }
  }

  /**
   * Fetch current session from API
   */
  async function checkSession() {
    try {
      const response = await fetch(`${API_URL}/api/auth/session`, {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        // Only set session if user exists and has data
        if (data?.user?.email) {
          setSession(data)
        }
      }
    } catch (error) {
      console.error('Failed to check session:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Start OAuth flow with provider using form POST
   */
  function handleLogin(provider: 'google' | 'github') {
    // Create and submit a form to start OAuth
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `${API_URL}/api/auth/signin/${provider}`
    
    // Add CSRF token
    const csrfInput = document.createElement('input')
    csrfInput.type = 'hidden'
    csrfInput.name = 'csrfToken'
    csrfInput.value = csrfToken
    form.appendChild(csrfInput)
    
    // Add callback URL to redirect back to frontend
    const callbackInput = document.createElement('input')
    callbackInput.type = 'hidden'
    callbackInput.name = 'callbackUrl'
    callbackInput.value = window.location.origin
    form.appendChild(callbackInput)
    
    document.body.appendChild(form)
    form.submit()
  }

  /**
   * Sign out user
   */
  async function handleLogout() {
    // Create form for signout
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `${API_URL}/api/auth/signout`
    
    const csrfInput = document.createElement('input')
    csrfInput.type = 'hidden'
    csrfInput.name = 'csrfToken'
    csrfInput.value = csrfToken
    form.appendChild(csrfInput)
    
    const callbackInput = document.createElement('input')
    callbackInput.type = 'hidden'
    callbackInput.name = 'callbackUrl'
    callbackInput.value = window.location.origin
    form.appendChild(callbackInput)
    
    document.body.appendChild(form)
    form.submit()
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2" style={{ color: theme.text.tertiary }}>
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  // Logged in state
  if (session?.user) {
    return (
      <div 
        className="flex items-center gap-3 px-4 py-2 rounded-lg"
        style={{ 
          backgroundColor: theme.bg.secondary,
          border: `1px solid ${theme.border.default}`
        }}
      >
        {/* Avatar */}
        {session.user.image && (
          <img 
            src={session.user.image} 
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        )}
        
        {/* User info */}
        <div className="flex flex-col">
          <span 
            className="text-sm font-medium"
            style={{ color: theme.text.primary }}
          >
            {session.user.name || 'User'}
          </span>
          <span 
            className="text-xs"
            style={{ color: theme.text.tertiary }}
          >
            {session.user.email}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="ml-2 p-2 rounded hover:opacity-80 transition-opacity"
          style={{ 
            backgroundColor: theme.bg.tertiary,
            color: theme.text.secondary
          }}
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    )
  }

  // Logged out state - show login buttons
  return (
    <div className="flex gap-3">
      {/* Google Sign In */}
      <button
        onClick={() => handleLogin('google')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        style={{ 
          backgroundColor: '#fff',
          border: '1px solid #dadce0',
          color: '#3c4043'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-sm font-medium">Google</span>
      </button>

      {/* GitHub Sign In */}
      <button
        onClick={() => handleLogin('github')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        style={{ 
          backgroundColor: '#24292e',
          color: '#fff'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <span className="text-sm font-medium">GitHub</span>
      </button>
    </div>
  )
}
