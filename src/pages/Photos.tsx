import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout, PageTitle } from "@/components/layout";
import { getPublicAlbums, PhotoAlbum } from "@/services/photoService";
import { formatEventDate } from "@/lib/utils";

const Photos = () => {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const data = await getPublicAlbums('hippie');
        setAlbums(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch albums:', err);
        setError('Failed to load photo albums');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

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
            <p className="text-hippie-coral text-center py-4">{error}</p>
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
