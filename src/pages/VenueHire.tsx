import { useState } from "react";
import { PageLayout, PageTitle } from "@/components/layout";

interface VenueCardProps {
  title: string;
  description: string;
  capacity: string;
  image: string;
  features: string[];
  availability: string;
  pricing: string;
  access: string;
}

const VenueCard = ({
  title,
  description,
  capacity,
  image,
  features,
  availability,
  pricing,
  access,
}: VenueCardProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black/40 backdrop-blur-sm border-2 border-hippie-coral/50 rounded-xl overflow-hidden shadow-lg">
      {/* Image with overlay label */}
      <div className="relative h-48 md:h-64">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder if image doesn't exist
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        <div className="absolute top-4 left-4 bg-hippie-gold px-4 py-2 rounded-full">
          <span className="font-display text-sm md:text-base uppercase tracking-wide text-hippie-charcoal">
            {title}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Description */}
        <p className="font-body text-hippie-white/90 text-sm md:text-base">
          {description}
        </p>

        {/* Capacity */}
        <div className="flex items-center gap-2">
          <span className="font-display text-hippie-gold text-sm uppercase tracking-wide">
            Capacity:
          </span>
          <span className="font-body text-hippie-white text-sm md:text-base">
            {capacity}
          </span>
        </div>

        {/* Accordion Sections */}
        <div className="space-y-2 pt-2">
          {/* Features */}
          <div className="border border-hippie-coral/30 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("features")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-hippie-coral/10 transition-colors"
            >
              <span className="font-display text-hippie-gold text-sm uppercase tracking-wide">
                Features
              </span>
              <svg
                className={`w-5 h-5 text-hippie-gold transition-transform ${
                  expandedSection === "features" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSection === "features" && (
              <div className="p-3 pt-0 border-t border-hippie-coral/30">
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="font-body text-hippie-white/80 text-sm flex items-start gap-2"
                    >
                      <span className="text-hippie-gold mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Capacity Details */}
          <div className="border border-hippie-coral/30 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("capacity")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-hippie-coral/10 transition-colors"
            >
              <span className="font-display text-hippie-gold text-sm uppercase tracking-wide">
                Capacity
              </span>
              <svg
                className={`w-5 h-5 text-hippie-gold transition-transform ${
                  expandedSection === "capacity" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSection === "capacity" && (
              <div className="p-3 pt-0 border-t border-hippie-coral/30">
                <p className="font-body text-hippie-white/80 text-sm">
                  {capacity}
                </p>
              </div>
            )}
          </div>

          {/* Availability & Pricing */}
          <div className="border border-hippie-coral/30 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("pricing")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-hippie-coral/10 transition-colors"
            >
              <span className="font-display text-hippie-gold text-sm uppercase tracking-wide">
                Availability & Pricing
              </span>
              <svg
                className={`w-5 h-5 text-hippie-gold transition-transform ${
                  expandedSection === "pricing" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSection === "pricing" && (
              <div className="p-3 pt-0 border-t border-hippie-coral/30 space-y-2">
                <div>
                  <span className="font-display text-hippie-gold text-xs uppercase tracking-wide">
                    Availability:
                  </span>
                  <p className="font-body text-hippie-white/80 text-sm mt-1">
                    {availability}
                  </p>
                </div>
                <div>
                  <span className="font-display text-hippie-gold text-xs uppercase tracking-wide">
                    Pricing:
                  </span>
                  <p className="font-body text-hippie-white/80 text-sm mt-1">
                    {pricing}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Access */}
          <div className="border border-hippie-coral/30 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("access")}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-hippie-coral/10 transition-colors"
            >
              <span className="font-display text-hippie-gold text-sm uppercase tracking-wide">
                Access
              </span>
              <svg
                className={`w-5 h-5 text-hippie-gold transition-transform ${
                  expandedSection === "access" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandedSection === "access" && (
              <div className="p-3 pt-0 border-t border-hippie-coral/30">
                <p className="font-body text-hippie-white/80 text-sm">
                  {access}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VenueHire = () => {
  const venues: VenueCardProps[] = [
    {
      title: "Downstairs",
      description:
        "Main bar, dance floor, and courtyard. Perfect for larger gatherings and parties.",
      capacity: "50-150 guests",
      image: "/downstairs-1.jpg",
      features: [
        "Main bar area",
        "Dance floor",
        "Outdoor courtyard",
        "DJ booth",
        "Sound system",
      ],
      availability: "Available for private hire on select dates",
      pricing: "Contact us for pricing",
      access: "Ground level access via main entrance",
    },
    {
      title: "Upstairs",
      description:
        "Karaoke booth and lounge bar. Ideal for smaller, more intimate events.",
      capacity: "20-70 guests",
      image: "/upstairs-1.jpg",
      features: [
        "Karaoke booth",
        "Lounge bar",
        "Private area",
        "Sound system",
        "Seating area",
      ],
      availability: "Available for private hire on select dates",
      pricing: "Contact us for pricing",
      access: "Access via stairs from main entrance",
    },
    {
      title: "Full Venue",
      description:
        "Exclusive hire of the entire venue. The ultimate party experience.",
      capacity: "150-250 guests",
      image: "/full-venue-1.jpg",
      features: [
        "Entire venue access",
        "Main bar & upstairs",
        "Dance floor",
        "Courtyard",
        "Karaoke booth",
        "Full sound system",
        "Private event",
      ],
      availability: "Available for exclusive hire on select dates",
      pricing: "Contact us for pricing",
      access: "Full venue access including all areas",
    },
  ];

  return (
    <PageLayout background="coral">
      <div className="flex-1 flex flex-col items-center px-4 py-8 md:py-12">
        <PageTitle className="mb-8 md:mb-12">Venue Hire</PageTitle>

        <div className="w-full max-w-6xl space-y-8 md:space-y-12">
          {venues.map((venue, index) => (
            <VenueCard key={index} {...venue} />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="font-body text-hippie-white/90 text-base md:text-lg mb-6">
            Interested in hiring our venue? Get in touch with us to discuss your event.
          </p>
          <a
            href="mailto:info@hippieclub.com"
            className="hippie-btn-primary text-lg px-8 py-4 inline-block"
          >
            Enquire Now
          </a>
        </div>
      </div>
    </PageLayout>
  );
};

export default VenueHire;

