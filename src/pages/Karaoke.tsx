import { PageLayout, PageTitle } from "@/components/layout";

const Karaoke = () => {
  return (
    <PageLayout background="dark">
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Page Title */}
        <PageTitle className="mb-8">Karaoke</PageTitle>

        {/* Image Carousel Placeholder */}
        <div className="relative w-full max-w-lg mb-8">
          <div className="aspect-[4/3] bg-hippie-charcoal-light rounded-lg flex items-center justify-center">
            <span className="text-hippie-white/50">Photo Carousel</span>
          </div>

          {/* Navigation Arrows */}
          <button
            className="hippie-nav-arrow absolute left-4 top-1/2 -translate-y-1/2"
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            className="hippie-nav-arrow absolute right-4 top-1/2 -translate-y-1/2"
            aria-label="Next photo"
          >
            ›
          </button>
        </div>

        {/* Content Section */}
        <div className="w-full max-w-lg text-center">
          <h3 className="font-display text-xl md:text-2xl uppercase tracking-wide mb-4">
            Private Karaoke Booth Now Available for Hire!
          </h3>
          <p className="font-body text-hippie-white/80 mb-8">
            Perfect for birthdays, special occasions or just a fun night out with friends.
          </p>
          <a
            href="mailto:afterdark@themanorleederville.com.au?subject=Karaoke Booth Booking"
            className="hippie-btn-primary"
          >
            Book Now
          </a>
        </div>
      </div>
    </PageLayout>
  );
};

export default Karaoke;

