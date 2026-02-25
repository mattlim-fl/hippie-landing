import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
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

interface LostPropertyFieldsProps {
  register: UseFormRegister<ContactFormData>
  errors: FieldErrors<ContactFormData>
}

export function LostPropertyFields({ register, errors }: LostPropertyFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-hippie-white mb-1">
          What did you lose? *
        </label>
        <Textarea
          {...register('itemDescription', { required: 'Please describe the item' })}
          placeholder="Describe the item (e.g., black iPhone 14, blue wallet with ID)"
          className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white placeholder:text-hippie-white/50 focus:border-hippie-gold"
          rows={3}
        />
        {errors.itemDescription && (
          <p className="text-sm text-red-400 mt-1">{errors.itemDescription.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-hippie-white mb-1">
          When did you lose it? *
        </label>
        <Input
          type="date"
          {...register('dateLost', { required: 'Please select a date' })}
          className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white focus:border-hippie-gold"
        />
        {errors.dateLost && (
          <p className="text-sm text-red-400 mt-1">{errors.dateLost.message}</p>
        )}
      </div>
    </div>
  )
}
