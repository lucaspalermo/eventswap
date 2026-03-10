'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseRealtimeOptions {
  table: string
  schema?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onInsert?: (payload: Record<string, unknown>) => void
  onUpdate?: (payload: Record<string, unknown>) => void
  onDelete?: (payload: Record<string, unknown>) => void
  onChange?: (payload: Record<string, unknown>) => void
  enabled?: boolean
}

export function useRealtime({
  table,
  schema = 'public',
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeOptions) {
  const supabase = createClient()

  // Use refs for callbacks to avoid re-subscribing on every render
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete, onChange })
  callbacksRef.current = { onInsert, onUpdate, onDelete, onChange }

  useEffect(() => {
    if (!enabled) return

    const channelName = `realtime:${table}:${filter || 'all'}`

    const channelConfig: {
      event: string
      schema: string
      table: string
      filter?: string
    } = {
      event,
      schema,
      table,
    }
    if (filter) {
      channelConfig.filter = filter
    }

    const channel = supabase
      .channel(channelName)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes', channelConfig as never, (payload: any) => {
        callbacksRef.current.onChange?.(payload as unknown as Record<string, unknown>)

        if (payload.eventType === 'INSERT') callbacksRef.current.onInsert?.(payload.new as Record<string, unknown>)
        if (payload.eventType === 'UPDATE') callbacksRef.current.onUpdate?.(payload.new as Record<string, unknown>)
        if (payload.eventType === 'DELETE') callbacksRef.current.onDelete?.(payload.old as Record<string, unknown>)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, schema, event, filter, enabled, supabase])
}
