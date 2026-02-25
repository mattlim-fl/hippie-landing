import { useState } from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface ContactFormData {
  name: string
  email: string
  phone?: string
  itemDescription?: string
  dateLost?: string
  message?: string
  queryDescription?: string
  incidentDate?: string
  requestedAction?: string
  needsFollowUp?: boolean
}

interface BusinessHoursViewProps {
  register: UseFormRegister<ContactFormData>
  errors: FieldErrors<ContactFormData>
  needsFollowUp: boolean
  onFollowUpChange: (checked: boolean) => void
}

export function BusinessHoursView({
  register,
  errors,
  needsFollowUp,
  onFollowUpChange,
}: BusinessHoursViewProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-hippie-teal-dark/50 border border-hippie-gold/30 rounded-xl">
        <h3 className="font-display text-xl text-hippie-gold uppercase tracking-wide mb-4">
          Our Opening Hours
        </h3>
        <div className="space-y-3 font-body">
          <div className="flex justify-between items-center py-2 border-b border-hippie-gold/20">
            <span className="text-hippie-white">Friday</span>
            <span className="text-hippie-gold">9pm - 3am</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-hippie-gold/20">
            <span className="text-hippie-white">Saturday</span>
            <span className="text-hippie-gold">9pm - 3am</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-hippie-white/70">Sunday - Thursday</span>
            <span className="text-hippie-white/70">Private functions only</span>
          </div>
        </div>
        <p className="text-sm text-hippie-white/70 mt-4">
          We're also available for private functions on other days. Contact us for availability.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="needsFollowUp"
          checked={needsFollowUp}
          onCheckedChange={onFollowUpChange}
          className="mt-1 border-hippie-gold/50 data-[state=checked]:bg-hippie-gold data-[state=checked]:border-hippie-gold"
        />
        <label htmlFor="needsFollowUp" className="text-sm text-hippie-white cursor-pointer">
          I still need to contact someone about my question
        </label>
      </div>

      {needsFollowUp && (
        <div>
          <label className="block text-sm font-medium text-hippie-white mb-1">
            How can we help?
          </label>
          <Textarea
            {...register('message')}
            placeholder="Let us know what you need and we'll get back to you"
            className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white placeholder:text-hippie-white/50 focus:border-hippie-gold"
            rows={3}
          />
        </div>
      )}
    </div>
  )
}
