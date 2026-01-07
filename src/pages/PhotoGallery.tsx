import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageLayout, PageTitle } from "@/components/layout";
import { getPhotosByDate, PhotoAlbumImage } from "@/services/photoService";
import { formatEventDate } from "@/lib/utils";

const PhotoGallery = () => {
  const { date } = useParams<{ date: string }>();
  const [photos, setPhotos] = useState<PhotoAlbumImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!date) return;
      
      try {
        setLoading(true);
        const data = await getPhotosByDate('hippie', date);
        setPhotos(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch photos:', err);
        setError('Failed to load photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [date]);

  const getRotationClass = (index: number) => {
    const rotations = [
      "rotate-[-2deg]",
      "rotate-[1deg]",
      "rotate-[-1deg]",
      "rotate-[2deg]",
      "rotate-[-1.5deg]",
    ];
    return rotations[index % 5];
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
          <PageTitle>{formatEventDate(date)}</PageTitle>
          <div className="w-16" /> {/* Spacer for alignment */}
        </div>

        {/* Photo Grid */}
        <div className="w-full max-w-6xl">
          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className={`aspect-[3/4] bg-hippie-charcoal-light/50 rounded-lg animate-pulse ${getRotationClass(i)}`}
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-hippie-coral mb-4">{error}</p>
              <Link
                to="/photos"
                className="text-hippie-gold hover:underline"
              >
                Back to albums
              </Link>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-hippie-white/60 mb-4">
                No photos in this album yet.
              </p>
              <Link
                to="/photos"
                className="text-hippie-gold hover:underline"
              >
                Back to albums
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`
                    aspect-[3/4] bg-hippie-charcoal-light rounded-lg overflow-hidden
                    transform transition-transform hover:scale-105 hover:z-10
                    ${getRotationClass(index)}
                  `}
                >
                  <img
                    src={photo.public_url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PhotoGallery;
