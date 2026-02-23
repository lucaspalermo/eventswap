'use client'

import { useEffect } from 'react'
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
      .on('postgres_changes', channelConfig as never, (payload) => {
        onChange?.(payload as unknown as Record<string, unknown>)

        if (payload.eventType === 'INSERT') onInsert?.(payload.new as Record<string, unknown>)
        if (payload.eventType === 'UPDATE') onUpdate?.(payload.new as Record<string, unknown>)
        if (payload.eventType === 'DELETE') onDelete?.(payload.old as Record<string, unknown>)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, schema, event, filter, enabled])
}
