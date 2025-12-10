import { useState, useEffect } from 'react';

export default function AlbumFormModal({ isOpen, onClose, onSubmit, album = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (album) {
      setFormData({
        name: album.name || '',
        description: album.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [album, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter an album name');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Form submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {album ? 'Edit Album' : 'Create New Album'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Album name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Album Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Vacation 2024"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              rows="3"
              placeholder="Add a description for this album"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : (album ? 'Save Changes' : 'Create Album')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}