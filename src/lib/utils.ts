import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string to a readable format (e.g., "15 January 2024")
 * @param dateString - Date string to format
 * @param fallback - Fallback text if date is invalid or undefined
 * @returns Formatted date string or fallback
 */
export function formatEventDate(dateString: string | undefined, fallback: string = "Photos"): string {
  if (!dateString) return fallback;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}










