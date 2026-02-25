import { CheckCircle } from 'lucide-react'

interface SuccessStateProps {
  referenceCode: string
  category: string
  onReset: () => void
}

const categoryMessages: Record<string, { title: string; description: string }> = {
  lost_property: {
    title: 'Lost Property Inquiry Submitted',
    description: "We'll check our lost property storage and get back to you within 2-3 business days.",
  },
  skantech: {
    title: 'Inquiry Submitted',
    description: 'Your inquiry has been logged and will be reviewed by our security team. We aim to respond within 5-7 business days.',
  },
  business_hours: {
    title: 'Message Sent',
    description: "We've received your question and will get back to you soon.",
  },
  something_else: {
    title: 'Message Sent',
    description: "Thanks for reaching out! We'll get back to you as soon as possible.",
  },
}

export function SuccessState({ referenceCode, category, onReset }: SuccessStateProps) {
  const message = categoryMessages[category] || categoryMessages.something_else

  return (
    <div className="text-center py-8 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
      </div>

      <div>
        <h3 className="font-display text-2xl text-hippie-gold uppercase tracking-wide mb-2">
          {message.title}
        </h3>
        <p className="text-hippie-white/80">{message.description}</p>
      </div>

      <div className="p-6 bg-hippie-charcoal/50 border border-hippie-gold/30 rounded-xl">
        <p className="text-sm text-hippie-white/70 mb-2">Your reference code</p>
        <p className="font-mono text-2xl text-hippie-gold tracking-wider">{referenceCode}</p>
        <p className="text-xs text-hippie-white/50 mt-2">
          Keep this code for your records. You'll also receive it by email.
        </p>
      </div>

      <button
        onClick={onReset}
        className="hippie-btn-secondary px-6 py-3"
      >
        Submit Another Inquiry
      </button>
    </div>
  )
}
