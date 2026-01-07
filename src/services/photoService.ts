import getSupabase, { getSupabaseUrl } from '@/lib/supabaseClient';

export type Venue = 'hippie' | 'manor';

export interface PhotoAlbum {
  id: string;
  venue: Venue;
  event_date: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

export interface PhotoAlbumImage {
  id: string;
  album_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
  archived: boolean;
  public_url?: string;
}

const STORAGE_BUCKET = 'venue-photos';

/**
 * Get the public URL for a photo in storage
 */
export function getPhotoPublicUrl(storagePath: string): string {
  const supabaseUrl = getSupabaseUrl();
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

/**
 * Get all public (non-archived) albums for a venue
 */
export async function getPublicAlbums(venue: Venue): Promise<PhotoAlbum[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('photo_albums')
    .select('*')
    .eq('venue', venue)
    .eq('archived', false)
    .order('event_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch albums: ${error.message}`);
  }

  return data as PhotoAlbum[];
}

/**
 * Get a single album by its event date
 */
export async function getAlbumByDate(venue: Venue, eventDate: string): Promise<PhotoAlbum | null> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('photo_albums')
    .select('*')
    .eq('venue', venue)
    .eq('event_date', eventDate)
    .eq('archived', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch album: ${error.message}`);
  }

  return data as PhotoAlbum;
}

/**
 * Get all public (non-archived) photos for an album
 */
export async function getAlbumPhotos(albumId: string): Promise<PhotoAlbumImage[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('photo_album_images')
    .select('*')
    .eq('album_id', albumId)
    .eq('archived', false)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch photos: ${error.message}`);
  }

  // Add public URLs to each photo
  return (data as PhotoAlbumImage[]).map((photo) => ({
    ...photo,
    public_url: getPhotoPublicUrl(photo.storage_path),
  }));
}

/**
 * Get photos for an album by event date (convenience function)
 */
export async function getPhotosByDate(venue: Venue, eventDate: string): Promise<PhotoAlbumImage[]> {
  const album = await getAlbumByDate(venue, eventDate);
  if (!album) {
    return [];
  }
  return getAlbumPhotos(album.id);
}

