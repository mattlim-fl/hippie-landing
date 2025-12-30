import { PageLayout, PageTitle } from "@/components/layout";

const Priority = () => {
  return (
    <PageLayout background="teal">
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Page Title */}
        <PageTitle className="mb-8">25+ Priority</PageTitle>

        {/* Description */}
        <div className="w-full max-w-lg text-center mb-8">
          <p className="font-body text-hippie-white/80 mb-2">
            Disco from 11 'til late.
          </p>
          <p className="font-body text-hippie-white/80 mb-2">
            Skip the queue with Priority Entry and head straight inside.
          </p>
          <p className="font-body text-hippie-white/80 mb-8">
            Curated for a 25+ crowd.
          </p>

          {/* CTA Button */}
          <a
            href="mailto:afterdark@themanorleederville.com.au?subject=25+ Priority Booking"
            className="hippie-btn-primary"
          >
            Book Now
          </a>
        </div>

        {/* Venue Photo */}
        <div className="relative w-full max-w-3xl mb-8">
          <div className="aspect-video bg-hippie-teal-dark rounded-lg flex items-center justify-center">
            <span className="text-hippie-white/50">Venue Photo</span>
          </div>

          {/* Starburst Badge */}
          <div className="absolute -top-6 -right-6 md:top-4 md:right-4 w-28 h-28 md:w-36 md:h-36">
            <div className="hippie-starburst w-full h-full">
              <span className="hippie-starburst-text text-xs md:text-sm">
                Curated for<br />a 25+ crowd
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Priority;

