import { useState } from 'react';
import { shareAPI } from '../../services/api';

export default function ShareDialog({ isOpen, onClose, album }) {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(7);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const response = await shareAPI.createShare(album.id, expiresInDays);
      setShareUrl(response.data.share.shareUrl);
    } catch (error) {
      console.error('Error creating share:', error);
      alert('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy link');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Share Album
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

        {/* Album info */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-1">{album.name}</h3>
          <p className="text-sm text-gray-600">
            {album.photo_count} photo{album.photo_count !== 1 ? 's' : ''}
          </p>
        </div>

        {!shareUrl ? (
          <>
            {/* Expiration selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link expires in:
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="input-field"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Share Link'}
            </button>
          </>
        ) : (
          <>
            {/* Share URL */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share this link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="input-field flex-1 text-sm"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={handleCopyLink}
                  className="btn-primary whitespace-nowrap"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Anyone with this link can view the photos in this album. The link will expire in {expiresInDays} day{expiresInDays !== 1 ? 's' : ''}.
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full btn-secondary"
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}