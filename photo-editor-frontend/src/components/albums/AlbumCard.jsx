import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function AlbumCard({ album, onDelete, onEdit, onShare }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    navigate(`/albums/${album.id}`);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onShare(album);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(album);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    if (confirm(`Delete album "${album.name}"? This won't delete the photos.`)) {
      onDelete(album.id);
    }
  };

  // Get first 4 photo thumbnails for preview
  const previewPhotos = album.photos?.slice(0, 4) || [];
  const photoCount = parseInt(album.photo_count) || 0;

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
    >
      {/* Photo Grid Preview */}
      {/* Photo Grid Preview */}
<div className="aspect-square bg-gray-100 grid grid-cols-2 gap-1 p-1">
  {previewPhotos.length > 0 ? (
    <>
      {previewPhotos.map((photo, index) => (
        <div key={photo.id || index} className="bg-gray-200 rounded overflow-hidden">
          <img
            src={photo.thumbnail_url || photo.original_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
      {/* Fill empty slots if less than 4 photos */}
      {[...Array(Math.max(0, 4 - previewPhotos.length))].map((_, i) => (
        <div key={`empty-${i}`} className="bg-gray-200 rounded flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ))}
    </>
  ) : (
    // Empty state
    <>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ))}
    </>
  )}
</div>

      {/* Album Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
              {album.name}
            </h3>
            {album.description && (
              <p className="text-sm text-gray-600 truncate mt-1">
                {album.description}
              </p>
            )}
          </div>

          {/* Menu button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={handleShare}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Album
                  </button>
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Details
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Album
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Photo count */}
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {photoCount} photo{photoCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}