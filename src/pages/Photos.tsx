import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageLayout, PageTitle } from "@/components/layout";
import { getPublicAlbums } from "@/services/photoService";
import { formatEventDate } from "@/lib/utils";

const Photos = () => {
  const { data: albums = [], isLoading: loading, error } = useQuery({
    queryKey: ['photo-albums', 'hippie'],
    queryFn: () => getPublicAlbums('hippie'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <PageLayout background="greyscale-dark">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col items-center px-4 pt-8 pb-4">
          {/* Page Title */}
          <PageTitle className="mb-6">Photos</PageTitle>

          {/* Subtitle */}
          <p className="font-body text-hippie-white/80 text-center mb-8">
            Have you been snapped at Hippie Club?
          </p>

          {/* Date List */}
          <div className="w-full max-w-md space-y-3 mb-4">
            {loading ? (
              // Loading skeleton
              <>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-hippie-charcoal-light/50 rounded-full animate-pulse"
                  />
                ))}
              </>
            ) : error ? (
              <p className="text-hippie-coral text-center py-4">Failed to load photo albums</p>
            ) : albums.length === 0 ? (
              <p className="text-hippie-white/60 text-center py-4">
                No photo albums available yet. Check back soon!
              </p>
            ) : (
              albums.map((album, index) => (
                <Link
                  key={album.id}
                  to={`/photos/${album.event_date}`}
                  className={
                    index === 0
                      ? "hippie-btn-date-active w-full block text-center"
                      : "hippie-btn-date w-full block text-center"
                  }
                >
                  {formatEventDate(album.event_date)}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Venue Photo with Spinning Roundel - Full Width */}
        <div className="relative w-full aspect-video mb-8">
          {/* Venue photo */}
          <div className="w-full h-full overflow-hidden">
            <img
              src="/venue-photo.jpg"
              alt="Hippie Club venue photo"
              className="w-full h-full object-cover"
              loading="lazy"
              width={1806}
              height={1202}
            />
          </div>

          {/* Spinning roundel overlay */}
          <div className="absolute top-4 right-4 w-60 h-60 md:w-80 md:h-80 aspect-square">
            <img
              src="/roundel.png"
              alt="Spin me right round roundel"
              className="w-full h-full object-contain animate-spin-slow"
              loading="lazy"
              width={640}
              height={640}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Photos;
