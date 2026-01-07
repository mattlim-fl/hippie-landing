import { useSearchParams } from 'react-router-dom'
import { PageLayout, PageTitle } from '@/components/layout'
import GuestListEditor from '@/components/GuestListEditor'

export default function ManageGuestList() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  // Token format: bookingId.expiry.signature
  const [bookingId] = token.split('.')

  const valid = Boolean(bookingId && token.split('.').length >= 3)

  return (
    <PageLayout background="dark">
      <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-12">
        <PageTitle className="mb-2">Manage Your Guest List</PageTitle>
        <p className="text-sm text-hippie-white/70 text-center max-w-md mb-8">
          Use this page to add or update the names of the guests who will be attending with you.
        </p>

        {!valid && (
          <div className="w-full max-w-lg mt-6 rounded-xl border border-hippie-coral/50 bg-hippie-coral/10 p-4 text-sm">
            <p className="font-medium text-hippie-coral">This link is not valid.</p>
            <p className="mt-1 text-xs text-hippie-white/70">
              Please open the guest list link directly from your latest confirmation email, or contact the venue if you
              need help updating your guests.
            </p>
          </div>
        )}

        {valid && bookingId && (
          <div className="w-full max-w-2xl">
            <GuestListEditor
              bookingId={bookingId}
              token={token}
              heading="Your Guests"
              subheading="Add the names of your guests so they're on the door when they arrive. You can update this list any time before your booking."
            />
          </div>
        )}
      </div>
    </PageLayout>
  )
}




