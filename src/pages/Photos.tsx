import { Link } from "react-router-dom";
import { PageLayout, PageTitle } from "@/components/layout";

// Sample dates - in production these would come from an API
const eventDates = [
  { date: "2025-11-22", label: "22 November 2025", isLatest: true },
  { date: "2025-11-15", label: "15 November 2025", isLatest: false },
  { date: "2025-11-08", label: "8 November 2025", isLatest: false },
  { date: "2025-11-01", label: "1 November 2025", isLatest: false },
  { date: "2025-10-16", label: "16 October 2025", isLatest: false },
  { date: "2025-10-09", label: "9 October 2025", isLatest: false },
  { date: "2025-10-02", label: "2 October 2025", isLatest: false },
];

const Photos = () => {
  return (
    <PageLayout background="dark">
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Page Title */}
        <PageTitle className="mb-6">Photos</PageTitle>

        {/* Subtitle */}
        <p className="font-body text-hippie-white/80 text-center mb-8">
          Have you been snapped at Hippie Club?
        </p>

        {/* Date List */}
        <div className="w-full max-w-md space-y-3 mb-12">
          {eventDates.map((event) => (
            <Link
              key={event.date}
              to={`/photos/${event.date}`}
              className={event.isLatest ? "hippie-btn-date-active w-full block text-center" : "hippie-btn-date w-full block text-center"}
            >
              {event.label}
            </Link>
          ))}
        </div>

        {/* Venue Photo with Spinning Text */}
        <div className="relative w-full max-w-2xl aspect-video mb-8">
          {/* Placeholder for venue photo */}
          <div className="w-full h-full bg-hippie-charcoal-light rounded-lg flex items-center justify-center">
            <span className="text-hippie-white/50">Venue Photo</span>
          </div>

          {/* Spinning text overlay placeholder */}
          <div className="absolute top-4 right-4 w-32 h-32">
            <div className="w-full h-full rounded-full border-2 border-hippie-gold flex items-center justify-center animate-spin-slow">
              <span className="text-hippie-gold text-xs text-center px-2 animate-none">
                You spin me right round...
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Photos;




