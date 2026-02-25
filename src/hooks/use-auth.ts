'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { createElement } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database.types'
import {
  isDemoMode,
  getDemoSession,
  getDemoProfile,
  demoSignIn,
  demoSignUp,
  clearDemoSession,
  type DemoUser,
} from '@/lib/demo-auth'

// ---------------------------------------------------------------------------
// Auth context — single source of truth for auth state
// ---------------------------------------------------------------------------

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  isDemo: boolean
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthState | null>(null)

// ---------------------------------------------------------------------------
// AuthProvider — fetches auth ONCE, shares via context to all components
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  const supabase = createClient()

  const restoreDemoSession = useCallback(() => {
    const demoUser = getDemoSession()
    if (demoUser) {
      setUser({
        id: demoUser.id,
        email: demoUser.email,
        app_metadata: {},
        user_metadata: { name: demoUser.name },
        aud: 'authenticated',
        created_at: '',
      } as User)
      setProfile(getDemoProfile(demoUser.id))
      setIsDemo(true)
    }
    setLoading(false)
  }, [])

  const setDemoUserState = useCallback((demoUser: DemoUser) => {
    setUser({
      id: demoUser.id,
      email: demoUser.email,
      app_metadata: {},
      user_metadata: { name: demoUser.name },
      aud: 'authenticated',
      created_at: '',
    } as User)
    setProfile(getDemoProfile(demoUser.id))
    setIsDemo(true)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isDemoMode()) {
      restoreDemoSession()
      return
    }

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          setProfile(data)
        }
      } catch {
        restoreDemoSession()
        return
      }

      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: { user: User | null } | null) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(data)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signOut = useCallback(async () => {
    if (isDemo || isDemoMode()) {
      clearDemoSession()
      setUser(null)
      setProfile(null)
      setIsDemo(false)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [isDemo, supabase])

  const signInWithGoogle = useCallback(async () => {
    if (isDemoMode()) {
      const demoUser = demoSignIn('google-user@example.com')
      setDemoUserState(demoUser)
      return
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    })
    if (error) throw error
  }, [supabase, setDemoUserState])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (isDemoMode()) {
      const demoUser = demoSignIn(email)
      setDemoUserState(demoUser)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [supabase, setDemoUserState])

  const signUpWithEmail = useCallback(async (email: string, password: string, name: string) => {
    if (isDemoMode()) {
      const demoUser = demoSignUp(email, name)
      setDemoUserState(demoUser)
      return
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    })
    if (error) throw error
  }, [supabase, setDemoUserState])

  const value: AuthState = {
    user,
    profile,
    loading,
    isDemo,
    signOut,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    isAdmin: profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN',
  }

  return createElement(AuthContext.Provider, { value }, children)
}

// ---------------------------------------------------------------------------
// useAuth hook — reads from context (zero network calls)
// ---------------------------------------------------------------------------

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    // Fallback for components outside AuthProvider (auth pages, landing, etc.)
    return {
      user: null,
      profile: null,
      loading: true,
      isDemo: false,
      signOut: async () => {},
      signInWithGoogle: async () => {},
      signInWithEmail: async () => {},
      signUpWithEmail: async () => {},
      isAdmin: false,
    }
  }
  return ctx
}
