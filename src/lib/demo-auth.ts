// Demo authentication for when Supabase is not configured
// Stores a fake session in localStorage so all pages work in demo mode

import type { Profile } from '@/types/database.types'

const DEMO_SESSION_KEY = 'eventswap_demo_session'

export interface DemoUser {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
}

const DEMO_PROFILES: Record<string, Profile> = {
  'demo-admin': {
    id: 'demo-admin',
    email: 'l.simports@hotmail.com',
    name: 'Admin EventSwap',
    display_name: 'Admin',
    phone: '(11) 99999-0000',
    cpf: '123.456.789-00',
    avatar_url: null,
    role: 'SUPER_ADMIN',
    kyc_status: 'APPROVED',
    asaas_customer_id: null,
    address_city: 'São Paulo',
    address_state: 'SP',
    address_country: 'BR',
    rating_avg: 5.0,
    rating_count: 10,
    is_verified: true,
    bio: 'Administrador da plataforma EventSwap.',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-02-23T00:00:00Z',
  },
  'demo-seller': {
    id: 'demo-seller',
    email: 'maria@example.com',
    name: 'Maria Silva',
    display_name: 'Maria S.',
    phone: '(21) 98888-1234',
    cpf: '987.654.321-00',
    avatar_url: null,
    role: 'USER',
    kyc_status: 'APPROVED',
    asaas_customer_id: null,
    address_city: 'Rio de Janeiro',
    address_state: 'RJ',
    address_country: 'BR',
    rating_avg: 4.8,
    rating_count: 32,
    is_verified: true,
    bio: 'Vendedora de reservas de eventos. Especialista em casamentos e buffets.',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-02-20T00:00:00Z',
  },
  'demo-buyer': {
    id: 'demo-buyer',
    email: 'joao@example.com',
    name: 'João Santos',
    display_name: 'João S.',
    phone: '(11) 97777-5678',
    cpf: '456.789.123-00',
    avatar_url: null,
    role: 'USER',
    kyc_status: 'APPROVED',
    asaas_customer_id: null,
    address_city: 'São Paulo',
    address_state: 'SP',
    address_country: 'BR',
    rating_avg: 4.5,
    rating_count: 8,
    is_verified: true,
    bio: 'Comprador de reservas de eventos.',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-02-22T00:00:00Z',
  },
}

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return true
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return !url || url.includes('placeholder')
}

export function getDemoSession(): DemoUser | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(DEMO_SESSION_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return null
}

export function setDemoSession(user: DemoUser): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user))
}

export function clearDemoSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DEMO_SESSION_KEY)
}

export function getDemoProfile(userId: string): Profile | null {
  return DEMO_PROFILES[userId] || null
}

export function demoSignIn(email: string): DemoUser {
  // Match by email or default to buyer
  if (email === 'l.simports@hotmail.com' || email === 'admin@eventswap.com') {
    const user: DemoUser = { id: 'demo-admin', email, name: 'Admin EventSwap', role: 'SUPER_ADMIN' }
    setDemoSession(user)
    return user
  }
  if (email === 'maria@example.com' || email.includes('vendedor') || email.includes('seller')) {
    const user: DemoUser = { id: 'demo-seller', email, name: 'Maria Silva', role: 'USER' }
    setDemoSession(user)
    return user
  }
  // Default: buyer/any user
  const user: DemoUser = { id: 'demo-buyer', email, name: 'João Santos', role: 'USER' }
  setDemoSession(user)
  return user
}

export function demoSignUp(email: string, name: string): DemoUser {
  const user: DemoUser = { id: 'demo-buyer', email, name, role: 'USER' }
  // Create a custom profile for this registration
  DEMO_PROFILES['demo-buyer'] = {
    ...DEMO_PROFILES['demo-buyer'],
    email,
    name,
    display_name: name,
  }
  setDemoSession(user)
  return user
}
