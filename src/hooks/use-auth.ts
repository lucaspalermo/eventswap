'use client'

import { useEffect, useState, useCallback } from 'react'
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  const supabase = createClient()

  // Restore demo session from localStorage
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

  // Set user state from demo user
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
        // Supabase not configured, fall back to demo mode
        restoreDemoSession()
        return
      }

      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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

  const signOut = async () => {
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
  }

  const signInWithGoogle = async () => {
    if (isDemoMode()) {
      // In demo mode, sign in as buyer
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
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (isDemoMode()) {
      const demoUser = demoSignIn(email)
      setDemoUserState(demoUser)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
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
  }

  return {
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
}
