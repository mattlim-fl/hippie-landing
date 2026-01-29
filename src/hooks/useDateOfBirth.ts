import { useState, useCallback, useMemo } from 'react'

interface UseDateOfBirthOptions {
  /** Minimum age required (default: 18) */
  minimumAge?: number
}

interface UseDateOfBirthResult {
  /** The parsed Date object (undefined if not set or invalid) */
  dateOfBirth: Date | undefined
  /** The string value for the date input */
  dateOfBirthString: string
  /** Handler for date input changes */
  handleChange: (value: string) => void
  /** Calculated age (null if date not set) */
  age: number | null
  /** Whether the age meets the minimum requirement */
  isAgeValid: boolean
  /** Clear the date of birth */
  clear: () => void
}

/**
 * Hook to manage date of birth input and age validation.
 * Extracts the common age validation logic from ticket purchase pages.
 */
export function useDateOfBirth({
  minimumAge = 18,
}: UseDateOfBirthOptions = {}): UseDateOfBirthResult {
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined)
  const [dateOfBirthString, setDateOfBirthString] = useState('')

  const handleChange = useCallback((value: string) => {
    setDateOfBirthString(value)

    if (value && value.length === 10) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        setDateOfBirth(date)
        return
      }
    }

    setDateOfBirth(undefined)
  }, [])

  const age = useMemo(() => {
    if (!dateOfBirth) return null

    const today = new Date()
    let calculatedAge = today.getFullYear() - dateOfBirth.getFullYear()
    const monthDiff = today.getMonth() - dateOfBirth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      calculatedAge -= 1
    }

    return calculatedAge
  }, [dateOfBirth])

  const isAgeValid = useMemo(() => {
    if (age === null) return false
    return age >= minimumAge
  }, [age, minimumAge])

  const clear = useCallback(() => {
    setDateOfBirth(undefined)
    setDateOfBirthString('')
  }, [])

  return {
    dateOfBirth,
    dateOfBirthString,
    handleChange,
    age,
    isAgeValid,
    clear,
  }
}
