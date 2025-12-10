import PhotoCard from './PhotoCard';


export default function PhotoGrid({ photos, onDelete, onAddToAlbum, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No photos yet
        </h3>
        <p className="text-gray-600">
          Upload your first photo to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onDelete={onDelete}
          onAddToAlbum={onAddToAlbum}
        />
      ))}
    </div>
  );
}