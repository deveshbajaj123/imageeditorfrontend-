import { useState, useEffect } from 'react';
import Navbar from '../components/shared/Navbar';
import PhotoUpload from '../components/photos/PhotoUpload';
import PhotoGrid from '../components/photos/PhotoGrid';
import Toast from '../components/shared/Toast';
import { photoAPI } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function Dashboard() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [stats, setStats] = useState({ total: 0 });
  const { toasts, showToast, hideToast } = useToast();

  // Fetch photos on mount
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await photoAPI.getPhotos({ page: 1, limit: 50 });
      setPhotos(response.data.photos);
      setStats({ total: response.data.pagination.total });
    } catch (error) {
      console.error('Error fetching photos:', error);
      showToast('Failed to load photos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (newPhotos) => {
    // Add new photos to the beginning of the list
    setPhotos([...newPhotos, ...photos]);
    setStats({ total: stats.total + newPhotos.length });
    setShowUpload(false);
    
    // Show success message
    showToast(`Successfully uploaded ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''}!`);
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await photoAPI.deletePhoto(photoId);
      
      // Remove from state
      setPhotos(photos.filter(p => p.id !== photoId));
      setStats({ total: stats.total - 1 });
      
      showToast('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      showToast(error.response?.data?.error || 'Failed to delete photo', 'error');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Photos
            </h1>
            <p className="text-gray-600">
              {stats.total} photo{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn-primary"
          >
            {showUpload ? '✕ Close' : '📤 Upload Photos'}
          </button>
        </div>

        {/* Upload section */}
        {showUpload && (
          <div className="mb-8">
            <PhotoUpload onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {/* Photos grid */}
        <PhotoGrid
          photos={photos}
          loading={loading}
          onDelete={handleDeletePhoto}
        />

        {/* Load more button */}
        {!loading && photos.length > 0 && photos.length < stats.total && (
          <div className="mt-8 text-center">
            <button className="btn-secondary">
              Load More Photos
            </button>
          </div>
        )}
      </div>

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