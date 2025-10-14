import { useState } from 'react';
import api from '../utils/api';

const LogoUpload = ({ businessId, currentLogo, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentLogo?.url || '');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit for images)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post(
        `/business/${businessId}/documents/logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setPreview(response.data.data.url);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the logo?')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await api.delete(`/business/${businessId}/documents/logo`);
      setPreview('');
      
      if (onUploadSuccess) {
        onUploadSuccess({ url: '', publicId: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete logo');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center space-x-6">
        {/* Logo Preview */}
        <div className="relative">
          {preview ? (
            <img
              src={preview}
              alt="Business Logo"
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-4xl">🏢</span>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Logo
          </label>
          <div className="flex items-center space-x-3">
            <label className="btn btn-primary cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={uploading}
              />
              {uploading ? 'Uploading...' : preview ? 'Change Logo' : 'Upload Logo'}
            </label>
            
            {preview && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn btn-danger"
              >
                {deleting ? 'Deleting...' : 'Remove'}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            JPG, PNG, GIF or WEBP (Max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;

