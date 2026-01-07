import React, { useEffect, useMemo, useState } from 'react'
import getSupabase from '../lib/supabaseClient'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface GuestListEditorProps {
  bookingId: string
  token?: string
  readOnly?: boolean
  heading?: string
  subheading?: string
}

export default function GuestListEditor({
  bookingId,
  token,
  readOnly = false,
  heading = 'Guest list',
  subheading = 'Add the names of the guests who will be using your tickets so they are on the door when they arrive.',
}: GuestListEditorProps) {
  const [maxGuests, setMaxGuests] = useState<number | null>(null)
  const [names, setNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const supabase = useMemo(() => getSupabase(), [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!bookingId) return
      setLoading(true)
      setError(null)
      setSaved(false)
      try {
        // Fetch booking to get max guests (ticket_quantity or guest_count)
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('ticket_quantity, guest_count')
          .eq('id', bookingId)
          .single()

        if (bookingError) {
          throw bookingError
        }

        const max = booking?.ticket_quantity || booking?.guest_count || 0

        // Fetch existing guest names
        const { data: guestRows, error: guestsError } = await supabase
          .from('booking_guests')
          .select('guest_name')
          .eq('booking_id', bookingId)
          .order('created_at')

        if (guestsError) {
          throw guestsError
        }

        const existing = (guestRows || []).map((r: { guest_name: string }) => r.guest_name)

        if (!cancelled) {
          setMaxGuests(max)
          if (max > 0) {
            const padded = [...existing]
            while (padded.length < max) padded.push('')
            setNames(padded.slice(0, max))
          } else {
            setNames([])
          }
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e)
          setError(msg || 'Failed to load guest list')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, token])

  const handleChangeName = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setSaved(false)
    setError(null)
  }

  const handleSave = async () => {
    if (readOnly) return
    if (!bookingId) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const cleaned = (names || []).map((n) => n.trim()).filter((n) => n.length > 0)

      // Delete existing guests for this booking
      const { error: deleteError } = await supabase
        .from('booking_guests')
        .delete()
        .eq('booking_id', bookingId)

      if (deleteError) {
        throw deleteError
      }

      // Insert new guest names
      if (cleaned.length > 0) {
        const toInsert = cleaned.map((name) => ({
          booking_id: bookingId,
          guest_name: name,
        }))
        const { error: insertError } = await supabase
          .from('booking_guests')
          .insert(toInsert)

        if (insertError) {
          throw insertError
        }
      }

      setSaved(true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg || 'Failed to save guest list')
    } finally {
      setSaving(false)
    }
  }

  if (loading && maxGuests === null) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600">
        Loading guest list…
      </div>
    )
  }

  if (maxGuests !== null && maxGuests <= 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white/60 p-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">{heading}</h4>
        {subheading && <p className="mt-1 text-xs text-gray-600">{subheading}</p>}
        {maxGuests && maxGuests > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            You can add up to <span className="font-medium">{maxGuests}</span> guests.
          </p>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {(names || []).map((value, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-6 text-xs font-medium text-gray-500">{idx + 1}.</span>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => handleChangeName(idx, e.target.value)}
                placeholder={`Guest ${idx + 1} full name`}
                disabled={readOnly}
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              {idx === 0 && (
                <Badge variant="secondary" className="shrink-0">
                  You
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-500">
            You can update this list any time using the link in your confirmation email.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save guest list'}
          </Button>
        </div>
      )}

      {saved && !error && (
        <p className="text-[11px] text-green-600">
          Guest list saved. Our team will see the latest names on the door list.
        </p>
      )}
    </div>
  )
}


