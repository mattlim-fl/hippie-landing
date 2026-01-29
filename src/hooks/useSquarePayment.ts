import { useEffect, useState } from 'react'
import { SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID, SQUARE_SCRIPT_SRC } from '../lib/config'

// Square SDK types
interface SquareCard {
  attach: (selector: string) => Promise<void>
  tokenize: () => Promise<{
    status: string
    token: string
    errors?: Array<{ message?: string }>
  }>
}

interface SquarePayments {
  card: () => Promise<SquareCard>
}

interface SquareGlobal {
  payments: (appId: string, locationId: string) => SquarePayments
}

interface UseSquarePaymentOptions {
  /** Whether to enable loading (e.g., only after data is fetched) */
  enabled: boolean
  /** Unique selector for the card container element */
  cardContainerId: string
  /** Callback when an error occurs */
  onError?: (message: string) => void
}

interface UseSquarePaymentResult {
  /** Whether the Square SDK has loaded */
  isLoaded: boolean
  /** Whether the card input is mounted and ready */
  isReady: boolean
  /** The Square card instance for tokenization */
  card: SquareCard | null
  /** Tokenize the card and return the payment token */
  tokenize: () => Promise<string>
}

/**
 * Hook to manage Square payment SDK loading and card mounting.
 * Extracts the common Square payment logic from ticket purchase pages.
 */
export function useSquarePayment({
  enabled,
  cardContainerId,
  onError,
}: UseSquarePaymentOptions): UseSquarePaymentResult {
  const [squareLoaded, setSquareLoaded] = useState(false)
  const [squarePayments, setSquarePayments] = useState<SquarePayments | null>(null)
  const [squareCard, setSquareCard] = useState<SquareCard | null>(null)
  const [cardMounted, setCardMounted] = useState(false)

  // Load Square SDK
  useEffect(() => {
    if (squareLoaded || !enabled) return

    const existing = document.querySelector(
      `script[src="${SQUARE_SCRIPT_SRC}"]`
    ) as HTMLScriptElement | null

    if (existing) {
      setSquareLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = SQUARE_SCRIPT_SRC
    script.async = true
    script.onload = () => setSquareLoaded(true)
    script.onerror = () => onError?.('Failed to load payment SDK')
    document.body.appendChild(script)
  }, [enabled, squareLoaded, onError])

  // Initialize payments instance when SDK is loaded
  useEffect(() => {
    if (!squareLoaded || squarePayments || !enabled) return

    const squareObj = (window as unknown as { Square?: SquareGlobal }).Square
    if (!squareObj) return

    try {
      const payments = squareObj.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID)
      setSquarePayments(payments)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      onError?.(msg || 'Failed to initialize payment SDK')
    }
  }, [squareLoaded, squarePayments, enabled, onError])

  // Create and mount the card when payments is ready
  useEffect(() => {
    let canceled = false

    const mount = async () => {
      if (!squarePayments || squareCard || cardMounted || !enabled) return

      try {
        const card = await squarePayments.card()
        await card.attach(cardContainerId)
        if (!canceled) {
          setSquareCard(card)
          setCardMounted(true)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        onError?.(msg || 'Failed to mount payment form')
      }
    }

    mount()
    return () => {
      canceled = true
    }
  }, [squarePayments, squareCard, cardMounted, enabled, cardContainerId, onError])

  const tokenize = async (): Promise<string> => {
    if (!squareCard) {
      throw new Error('Payment form not ready')
    }

    const result = await squareCard.tokenize()
    if (result.status !== 'OK') {
      throw new Error(result?.errors?.[0]?.message || 'Failed to process card')
    }

    return result.token
  }

  return {
    isLoaded: squareLoaded,
    isReady: cardMounted && squareCard !== null,
    card: squareCard,
    tokenize,
  }
}
