import { useState } from "react";
import { PageLayout, PageTitle } from "@/components/layout";

interface VenueOption {
  id: string;
  name: string;
  description: string;
  capacity: string;
  features: string[];
}

const venueOptions: VenueOption[] = [
  {
    id: "downstairs",
    name: "Downstairs",
    description: "Featuring the main bar, dance floor and courtyard.",
    capacity: "For 50 to 150 guests.",
    features: [
      "Main Bar area with cocktail service",
      "Dance floor with professional sound system",
      "DJ equipment & lighting",
      "Direct access to courtyard",
      "Ample male & female bathrooms",
    ],
  },
  {
    id: "upstairs",
    name: "Upstairs",
    description: "Featuring the karaoke booth, lounge bar and dance floor views.",
    capacity: "For 20 to 70 guests.",
    features: [
      "Private karaoke booth access",
      "Lounge bar with dedicated service",
      "Overlooking views of main dance floor",
      "Semi-private atmosphere",
    ],
  },
  {
    id: "fullvenue",
    name: "Full Venue",
    description: "Exclusive hire of Manor for events, celebrations and corporate functions.",
    capacity: "For 150 to 250 guests.",
    features: [
      "Complete venue exclusivity",
      "All bars and areas included",
      "Full AV and sound system access",
      "Dedicated event coordinator",
      "Custom catering options available",
    ],
  },
];

const VenueHire = () => {
  const [openAccordions, setOpenAccordions] = useState<Record<string, string | null>>({
    downstairs: "features",
    upstairs: null,
    fullvenue: null,
  });

  const toggleAccordion = (venueId: string, accordionId: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [venueId]: prev[venueId] === accordionId ? null : accordionId,
    }));
  };

  return (
    <PageLayout background="coral">
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Page Title */}
        <PageTitle className="mb-12">Venue Hire</PageTitle>

        {/* Venue Cards */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {venueOptions.map((venue) => (
            <div key={venue.id} className="flex flex-col">
              {/* Venue Image */}
              <div className="relative aspect-[4/5] bg-hippie-coral-dark rounded-lg mb-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-hippie-white/50">Venue Photo</span>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <span className="bg-hippie-gold text-hippie-green-dark font-display font-bold px-6 py-2 rounded-full uppercase text-sm">
                    {venue.name}
                  </span>
                </div>
              </div>

              {/* Venue Details */}
              <p className="font-body text-hippie-white/90 text-sm mb-2">
                {venue.description}
              </p>
              <p className="font-body text-hippie-white/70 text-sm mb-4">
                {venue.capacity}
              </p>

              {/* Accordions */}
              <div className="divide-y divide-hippie-gold/30">
                {/* Features */}
                <div>
                  <button
                    className="hippie-accordion-trigger text-sm"
                    onClick={() => toggleAccordion(venue.id, "features")}
                  >
                    <span>Features</span>
                    <span className="text-hippie-gold">
                      {openAccordions[venue.id] === "features" ? "−" : "+"}
                    </span>
                  </button>
                  {openAccordions[venue.id] === "features" && (
                    <div className="hippie-accordion-content">
                      <ul className="list-disc list-inside space-y-1">
                        {venue.features.map((feature, index) => (
                          <li key={index} className="text-hippie-white/80">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Capacity */}
                <div>
                  <button
                    className="hippie-accordion-trigger text-sm"
                    onClick={() => toggleAccordion(venue.id, "capacity")}
                  >
                    <span>Capacity</span>
                    <span className="text-hippie-gold">
                      {openAccordions[venue.id] === "capacity" ? "−" : "+"}
                    </span>
                  </button>
                  {openAccordions[venue.id] === "capacity" && (
                    <div className="hippie-accordion-content">
                      <p className="text-hippie-white/80">{venue.capacity}</p>
                    </div>
                  )}
                </div>

                {/* Availability & Pricing */}
                <div>
                  <button
                    className="hippie-accordion-trigger text-sm"
                    onClick={() => toggleAccordion(venue.id, "pricing")}
                  >
                    <span>Availability & Pricing</span>
                    <span className="text-hippie-gold">
                      {openAccordions[venue.id] === "pricing" ? "−" : "+"}
                    </span>
                  </button>
                  {openAccordions[venue.id] === "pricing" && (
                    <div className="hippie-accordion-content">
                      <p className="text-hippie-white/80">
                        Contact us for availability and custom pricing based on your event needs.
                      </p>
                    </div>
                  )}
                </div>

                {/* Access */}
                <div>
                  <button
                    className="hippie-accordion-trigger text-sm"
                    onClick={() => toggleAccordion(venue.id, "access")}
                  >
                    <span>Access</span>
                    <span className="text-hippie-gold">
                      {openAccordions[venue.id] === "access" ? "−" : "+"}
                    </span>
                  </button>
                  {openAccordions[venue.id] === "access" && (
                    <div className="hippie-accordion-content">
                      <p className="text-hippie-white/80">
                        Private entrance available for exclusive bookings. Standard entry via main venue entrance.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default VenueHire;




