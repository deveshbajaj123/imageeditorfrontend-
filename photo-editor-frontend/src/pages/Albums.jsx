import { useState, useEffect } from 'react';
import Navbar from '../components/shared/Navbar';
import AlbumCard from '../components/albums/AlbumCard';
import AlbumFormModal from '../components/albums/AlbumFormModal';
import ShareDialog from '../components/albums/ShareDialog';
import Toast from '../components/shared/Toast';
import { albumAPI } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [sharingAlbum, setSharingAlbum] = useState(null);
  const { toasts, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const response = await albumAPI.getAlbums();
      
      // Fetch photos for each album to show preview
      const albumsWithPhotos = await Promise.all(
        response.data.albums.map(async (album) => {
          try {
            const albumDetail = await albumAPI.getAlbum(album.id);
            return {
              ...album,
              photos: albumDetail.data.album.photos.slice(0, 4) // Get first 4 photos
            };
          } catch (error) {
            console.error(`Error fetching photos for album ${album.id}:`, error);
            return { ...album, photos: [] };
          }
        })
      );
      
      setAlbums(albumsWithPhotos);
    } catch (error) {
      console.error('Error fetching albums:', error);
      showToast('Failed to load albums', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (formData) => {
    try {
      const response = await albumAPI.create(formData);
      // Add new album with empty photos array
      setAlbums([{ ...response.data.album, photos: [] }, ...albums]);
      showToast('Album created successfully');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating album:', error);
      showToast(error.response?.data?.error || 'Failed to create album', 'error');
      throw error;
    }
  };

  const handleEditAlbum = async (formData) => {
    try {
      const response = await albumAPI.update(editingAlbum.id, formData);
      setAlbums(albums.map(a => 
        a.id === editingAlbum.id 
          ? { ...response.data.album, photos: a.photos } 
          : a
      ));
      showToast('Album updated successfully');
      setEditingAlbum(null);
    } catch (error) {
      console.error('Error updating album:', error);
      showToast(error.response?.data?.error || 'Failed to update album', 'error');
      throw error;
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    try {
      await albumAPI.delete(albumId);
      setAlbums(albums.filter(a => a.id !== albumId));
      showToast('Album deleted successfully');
    } catch (error) {
      console.error('Error deleting album:', error);
      showToast(error.response?.data?.error || 'Failed to delete album', 'error');
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
              My Albums
            </h1>
            <p className="text-gray-600">
              {albums.length} album{albums.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            ➕ New Album
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && albums.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No albums yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first album to organize your photos
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              ➕ Create Album
            </button>
          </div>
        )}

        {/* Albums grid */}
        {!loading && albums.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onDelete={handleDeleteAlbum}
                onEdit={(album) => setEditingAlbum(album)}
                onShare={(album) => setSharingAlbum(album)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AlbumFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAlbum}
      />

      <AlbumFormModal
        isOpen={!!editingAlbum}
        onClose={() => setEditingAlbum(null)}
        onSubmit={handleEditAlbum}
        album={editingAlbum}
      />

      <ShareDialog
        isOpen={!!sharingAlbum}
        onClose={() => setSharingAlbum(null)}
        album={sharingAlbum || {}}
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