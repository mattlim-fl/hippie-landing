import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UseFormSetValue } from 'react-hook-form'

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

interface SkantechFieldsProps {
  register: UseFormRegister<ContactFormData>
  errors: FieldErrors<ContactFormData>
  setValue: UseFormSetValue<ContactFormData>
  requestedAction?: string
}

export function SkantechFields({ register, errors, setValue, requestedAction }: SkantechFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-hippie-gold/10 border border-hippie-gold/30 rounded-lg">
        <p className="text-sm text-hippie-white/90">
          If you believe you've been incorrectly identified by our security system or have a
          question about an incident, please provide the details below. All inquiries are
          reviewed by our security team.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-hippie-white mb-1">
          Describe your inquiry *
        </label>
        <Textarea
          {...register('queryDescription', { required: 'Please describe your inquiry' })}
          placeholder="Please provide as much detail as possible about your situation"
          className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white placeholder:text-hippie-white/50 focus:border-hippie-gold"
          rows={4}
        />
        {errors.queryDescription && (
          <p className="text-sm text-red-400 mt-1">{errors.queryDescription.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-hippie-white mb-1">
          Date of incident *
        </label>
        <Input
          type="date"
          {...register('incidentDate', { required: 'Please select a date' })}
          className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white focus:border-hippie-gold"
        />
        {errors.incidentDate && (
          <p className="text-sm text-red-400 mt-1">{errors.incidentDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-hippie-white mb-1">
          What would you like us to do? *
        </label>
        <Select
          value={requestedAction}
          onValueChange={(value) => setValue('requestedAction', value)}
        >
          <SelectTrigger className="bg-hippie-charcoal border-hippie-gold/30 text-hippie-white focus:border-hippie-gold">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent className="bg-hippie-charcoal border-hippie-gold/30">
            <SelectItem value="review_ban" className="text-hippie-white">Review my ban status</SelectItem>
            <SelectItem value="provide_info" className="text-hippie-white">I have information about an incident</SelectItem>
            <SelectItem value="question" className="text-hippie-white">I have a question</SelectItem>
            <SelectItem value="other" className="text-hippie-white">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.requestedAction && (
          <p className="text-sm text-red-400 mt-1">{errors.requestedAction.message}</p>
        )}
      </div>
    </div>
  )
}
