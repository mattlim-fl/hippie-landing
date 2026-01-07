import { useParams, Link } from "react-router-dom";
import { PageLayout, PageTitle } from "@/components/layout";

// Sample photos - in production these would come from an API
const samplePhotos = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  src: `/placeholder.svg`,
  alt: `Party photo ${i + 1}`,
}));

const PhotoGallery = () => {
  const { date } = useParams<{ date: string }>();

  // Format the date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Photos";
    try {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <PageLayout background="dark">
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Back link and Page Title */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8">
          <Link
            to="/photos"
            className="font-display text-sm text-hippie-white/80 uppercase tracking-wide hover:text-hippie-gold transition-colors"
          >
            ← Back
          </Link>
          <PageTitle>{formatDate(date)}</PageTitle>
          <div className="w-16" /> {/* Spacer for alignment */}
        </div>

        {/* Photo Grid */}
        <div className="w-full max-w-6xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {samplePhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`
                aspect-[3/4] bg-hippie-charcoal-light rounded-lg overflow-hidden
                transform transition-transform hover:scale-105 hover:z-10
                ${index % 5 === 0 ? "rotate-[-2deg]" : ""}
                ${index % 5 === 1 ? "rotate-[1deg]" : ""}
                ${index % 5 === 2 ? "rotate-[-1deg]" : ""}
                ${index % 5 === 3 ? "rotate-[2deg]" : ""}
                ${index % 5 === 4 ? "rotate-[-1.5deg]" : ""}
              `}
            >
              {/* Placeholder - replace with actual images */}
              <div className="w-full h-full flex items-center justify-center text-hippie-white/30 text-xs">
                Photo {photo.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default PhotoGallery;




