import { useState } from "react";
import { PageLayout, PageTitle } from "@/components/layout";

const GuestList = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>("package");

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <PageLayout background="teal">
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Page Title */}
        <PageTitle className="mb-8">Guest List</PageTitle>

        {/* Image Carousel Placeholder */}
        <div className="relative w-full max-w-lg mb-8">
          <div className="aspect-[4/3] bg-hippie-teal-dark rounded-lg flex items-center justify-center">
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
        <div className="w-full max-w-lg text-center mb-8">
          <h3 className="font-display text-xl md:text-2xl uppercase tracking-wide mb-4">
            Birthdays & Occasions
          </h3>
          <p className="font-body text-hippie-white/80 mb-6">
            Great for cocktail parties, celebrations, events and corporate functions up to 150 people.
          </p>
          <a href="mailto:afterdark@themanorleederville.com.au" className="hippie-btn-primary">
            Enquire
          </a>
        </div>

        {/* Accordions */}
        <div className="w-full max-w-lg divide-y divide-hippie-gold/30">
          {/* Package Options */}
          <div>
            <button
              className="hippie-accordion-trigger"
              onClick={() => toggleAccordion("package")}
            >
              <span>Package Options</span>
              <span className="text-hippie-gold">{openAccordion === "package" ? "−" : "+"}</span>
            </button>
            {openAccordion === "package" && (
              <div className="hippie-accordion-content">
                <p>
                  Choose from intimate packages for 10-15 guests or larger celebrations for up to 50 people. 
                  All packages include dedicated service and customizable amenities.
                </p>
              </div>
            )}
          </div>

          {/* Customisation */}
          <div>
            <button
              className="hippie-accordion-trigger"
              onClick={() => toggleAccordion("custom")}
            >
              <span>Customisation</span>
              <span className="text-hippie-gold">{openAccordion === "custom" ? "−" : "+"}</span>
            </button>
            {openAccordion === "custom" && (
              <div className="hippie-accordion-content">
                <p>
                  Personalize your event with custom decorations, themed setups, and special requests. 
                  Our team will work with you to create an unforgettable experience.
                </p>
              </div>
            )}
          </div>

          {/* Advance Bookings */}
          <div>
            <button
              className="hippie-accordion-trigger"
              onClick={() => toggleAccordion("bookings")}
            >
              <span>Advance Bookings</span>
              <span className="text-hippie-gold">{openAccordion === "bookings" ? "−" : "+"}</span>
            </button>
            {openAccordion === "bookings" && (
              <div className="hippie-accordion-content">
                <p>
                  Book in advance to secure your preferred date and time. 
                  We recommend booking at least 2 weeks ahead for weekend events.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Starburst Graphic */}
        <div className="mt-12 relative w-40 h-40">
          <div className="hippie-starburst w-full h-full">
            <span className="hippie-starburst-text text-sm">
              Celebrate at<br />Hip-E Club
            </span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default GuestList;

