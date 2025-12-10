import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PhotoCard({ photo, onDelete, onAddToAlbum }) {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/editor/${photo.id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(photo.id);
    } catch (error) {
      console.error('Delete error:', error);
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className="relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={photo.thumbnail_url || photo.original_url}
          alt={photo.filename}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Actions overlay */}
      {showActions && !showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-2 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            title="Edit photo"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
            title="Delete photo"
          >
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {onAddToAlbum && (
            <button
              onClick={() => onAddToAlbum(photo)}
              className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              title="Add to album"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-4 text-center">
          <p className="text-sm font-medium text-gray-900 mb-4">
            Delete this photo?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Photo info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate mb-1">
          {photo.filename}
        </p>
        <p className="text-xs text-gray-500">
          {formatDate(photo.created_at)}
        </p>
      </div>
    </div>
  );
}