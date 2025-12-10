import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { shareAPI } from '../services/api';
import ImageLightbox from '../components/shared/ImageLightbox';

export default function SharedAlbum() {
  const { token } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchSharedAlbum();
  }, [token]);

  const fetchSharedAlbum = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await shareAPI.getSharedAlbum(token);
      setAlbum(response.data.album);
    } catch (error) {
      console.error('Error fetching shared album:', error);
      if (error.response?.status === 404) {
        setError('This share link is invalid or has expired.');
      } else {
        setError('Failed to load shared album. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Simple header */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📸</span>
                <span className="text-xl font-bold text-primary-600">
                  Photo Editor
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Loading content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-48 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Simple header */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📸</span>
                <span className="text-xl font-bold text-primary-600">
                  Photo Editor
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Error content */}
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Link Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              {error}
            </p>
            < a
              href="/"
              className="inline-block btn-primary"
            >
              Go to Photo Editor
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Success state with album
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📸</span>
              <span className="text-xl font-bold text-primary-600">
                Photo Editor
              </span>
            </div>
            <a href="/register" className="btn-primary text-sm">
              Sign Up Free
            </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Album info */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Shared by {album.sharedBy || 'someone'}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {album.name}
          </h1>
          
          {album.description && (
            <p className="text-gray-600 mb-4">
              {album.description}
            </p>
          )}
          
          <p className="text-sm text-gray-500">
            {album.photos?.length || 0} photo{album.photos?.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Photos grid */}
        {album.photos && album.photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
            {album.photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setLightboxImage(photo.original_url)}
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={photo.thumbnail_url || photo.original_url}
                    alt={photo.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {photo.filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No photos in this album
            </h3>
            <p className="text-gray-600">
              This album is currently empty
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">
            Create Your Own Albums
          </h2>
          <p className="text-primary-100 mb-6">
            Upload, organize, and share your photos with Photo Editor
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/register" className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Sign Up Free
            </a>
            <a href="/login" className="px-6 py-3 bg-primary-700 text-white rounded-lg font-medium hover:bg-primary-800 transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            © 2024 Photo Editor. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}