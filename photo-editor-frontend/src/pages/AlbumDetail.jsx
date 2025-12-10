import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import PhotoCard from '../components/photos/PhotoCard';
import ShareDialog from '../components/albums/ShareDialog';
import Toast from '../components/shared/Toast';
import { albumAPI, photoAPI } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAddPhotos, setShowAddPhotos] = useState(false);
  const [allPhotos, setAllPhotos] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const { toasts, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  const fetchAlbum = async () => {
    setLoading(true);
    try {
      const response = await albumAPI.getAlbum(id);
      setAlbum(response.data.album);
    } catch (error) {
      console.error('Error fetching album:', error);
      showToast('Failed to load album', 'error');
      navigate('/albums');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPhotos = async () => {
    try {
      const response = await photoAPI.getPhotos();
      setAllPhotos(response.data.photos);
    } catch (error) {
      console.error('Error fetching photos:', error);
      showToast('Failed to load photos', 'error');
    }
  };

  const handleRemovePhoto = async (photoId) => {
    try {
      await albumAPI.removePhoto(id, photoId);
      setAlbum({
        ...album,
        photos: album.photos.filter(p => p.id !== photoId)
      });
      showToast('Photo removed from album');
    } catch (error) {
      console.error('Error removing photo:', error);
      showToast('Failed to remove photo', 'error');
    }
  };

  const handleAddPhotos = async () => {
    if (selectedPhotos.length === 0) {
      showToast('Please select at least one photo', 'error');
      return;
    }

    try {
      // Add each selected photo to album
      for (const photoId of selectedPhotos) {
        await albumAPI.addPhoto(id, photoId);
      }
      
      showToast(`Added ${selectedPhotos.length} photo${selectedPhotos.length > 1 ? 's' : ''} to album`);
      setShowAddPhotos(false);
      setSelectedPhotos([]);
      fetchAlbum(); // Refresh album
    } catch (error) {
      console.error('Error adding photos:', error);
      showToast('Failed to add photos', 'error');
    }
  };

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-64 mb-8" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          to="/albums"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Albums
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {album.name}
              </h1>
              {album.description && (
                <p className="text-gray-600 mb-2">{album.description}</p>
              )}
              <p className="text-sm text-gray-500">
                {album.photos?.length || 0} photo{album.photos?.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowShareDialog(true)}
                className="btn-secondary"
              >
                🔗 Share
              </button>
              <button
                onClick={() => {
                  fetchAllPhotos();
                  setShowAddPhotos(true);
                }}
                className="btn-primary"
              >
                ➕ Add Photos
              </button>
            </div>
          </div>
        </div>

        {/* Photos grid */}
        {album.photos && album.photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {album.photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <PhotoCard
photo={photo}
onDelete={() => {}} // Don't delete photo, just remove from album
/>
<button
onClick={() => handleRemovePhoto(photo.id)}
className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
title="Remove from album"
>
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>
))}
</div>
) : (
<div className="text-center py-16">
<div className="text-6xl mb-4">📷</div>
<h3 className="text-xl font-semibold text-gray-900 mb-2">
No photos in this album
</h3>
<p className="text-gray-600 mb-6">
Add photos from your library to get started
</p>
<button
onClick={() => {
fetchAllPhotos();
setShowAddPhotos(true);
}}
className="btn-primary"
>
➕ Add Photos
</button>
</div>
)}
</div>
{/* Add Photos Modal */}
  {showAddPhotos && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Add Photos to Album
          </h2>
          <button
            onClick={() => {
              setShowAddPhotos(false);
              setSelectedPhotos([]);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Photos grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {allPhotos.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No photos available. Upload photos first.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allPhotos.map((photo) => {
                const isSelected = selectedPhotos.includes(photo.id);
                const isInAlbum = album.photos?.some(p => p.id === photo.id);

                return (
                  <div
                    key={photo.id}
                    onClick={() => !isInAlbum && togglePhotoSelection(photo.id)}
                    className={`
                      relative aspect-square rounded-lg overflow-hidden cursor-pointer
                      ${isInAlbum ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                      ${isSelected ? 'ring-4 ring-primary-500' : ''}
                    `}
                  >
                    <img
                      src={photo.thumbnail_url || photo.original_url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                    
                    {isInAlbum && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          Already in album
                        </span>
                      </div>
                    )}

                    {isSelected && !isInAlbum && (
                      <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAddPhotos(false);
                setSelectedPhotos([]);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPhotos}
              disabled={selectedPhotos.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Share Dialog */}
  <ShareDialog
    isOpen={showShareDialog}
    onClose={() => setShowShareDialog(false)}
    album={album}
  />

  {/* Toast notifications */}
  {toasts.map((toast) => (
    <Toast
      key={toast.id}
      message={toast.message}
      type={toast.type}
      onClose={() => hideToast(toast.id)}
    />
  ))}
</div>
);
}