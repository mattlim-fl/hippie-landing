import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLayout, PageTitle } from "@/components/layout";
import { GuestListModal } from "@/components/GuestListModal";
import GuestListEditor from "@/components/GuestListEditor";

const GuestList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Check if this is a booking guest list management link (has token parameter)
  const token = searchParams.get('token') || '';
  const [bookingId] = token.split('.');
  const hasValidToken = Boolean(bookingId && token.split('.').length >= 3);

  // If there's a valid token, show the guest list editor view
  if (hasValidToken && bookingId) {
    return (
      <PageLayout background="dark">
        <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-12">
          <PageTitle className="mb-2">Manage Your Guest List</PageTitle>
          <p className="text-sm text-hippie-white/70 text-center max-w-md mb-8">
            Use this page to add or update the names of the guests who will be attending with you.
          </p>

          <div className="w-full max-w-2xl">
            <GuestListEditor
              bookingId={bookingId}
              token={token}
              heading="Your Guests"
              subheading="Add the names of your guests so they're on the door when they arrive. You can update this list any time before your booking."
            />
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show invalid token error if token is present but invalid
  if (token && !hasValidToken) {
    return (
      <PageLayout background="dark">
        <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-12">
          <PageTitle className="mb-2">Manage Your Guest List</PageTitle>
          <div className="w-full max-w-lg mt-6 rounded-xl border border-hippie-coral/50 bg-hippie-coral/10 p-4 text-sm">
            <p className="font-medium text-hippie-coral">This link is not valid.</p>
            <p className="mt-1 text-xs text-hippie-white/70">
              Please open the guest list link directly from your latest confirmation email, or contact the venue if you
              need help updating your guests.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Default: show the "Get on the List" marketing page
  return (
    <PageLayout background="teal">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Page Title */}
        <PageTitle className="mb-8">Guest List</PageTitle>

        {/* Content Section */}
        <div className="w-full max-w-2xl text-center space-y-6">
          <h3 className="font-display text-2xl md:text-4xl uppercase tracking-wide text-hippie-white">
            Get on the List
          </h3>
          
          <p className="font-body text-lg md:text-xl text-hippie-white/90 max-w-xl mx-auto">
            Follow us on social media to stay updated on upcoming events, special nights, and get added to our exclusive guest list.
          </p>

          <div className="pt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="hippie-btn-primary text-lg px-12 py-4"
            >
              Join Guest List
            </button>
          </div>

          {/* Additional Info */}
          <div className="pt-12 space-y-4">
            <p className="font-body text-hippie-white/70">
              Open every Saturday from 9pm - 5am
            </p>
            <p className="font-body text-hippie-white/70">
              Follow us for weekly updates, event announcements, and exclusive promotions
            </p>
          </div>

          {/* 25+ Priority at Manor Section */}
          <div className="pt-12 space-y-4">
            <p className="font-body text-hippie-white/80 text-lg">
              Did you know there's a 25+ list at Manor?
            </p>
            <div className="w-full max-w-xs mx-auto border-t border-hippie-white/30"></div>
            <a
              href="https://manorleederville.com/priority-entry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hippie-btn-primary text-lg px-8 py-3"
            >
              25+ Priority at Manor
            </a>
          </div>
        </div>

        {/* Starburst Graphic */}
        <div className="mt-16 relative w-40 h-40">
          <div className="hippie-starburst w-full h-full">
            <span className="hippie-starburst-text text-sm">
              Disco<br />Every Saturday
            </span>
          </div>
        </div>
      </div>

      {/* Guest List Modal */}
      <GuestListModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </PageLayout>
  );
};

export default GuestList;

