import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'

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
}

interface GeneralFieldsProps {
  register: UseFormRegister<ContactFormData>
  errors: FieldErrors<ContactFormData>
}

export function GeneralFields({ register, errors }: GeneralFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-hippie-white mb-1">
          Your message *
        </label>
        <Textarea
          {...register('message', { required: 'Please enter your message' })}
          placeholder="How can we help you?"
          className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white placeholder:text-hippie-white/50 focus:border-hippie-gold"
          rows={5}
        />
        {errors.message && (
          <p className="text-sm text-red-400 mt-1">{errors.message.message}</p>
        )}
      </div>
    </div>
  )
}
