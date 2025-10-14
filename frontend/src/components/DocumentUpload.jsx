import { useState } from 'react';
import api from '../utils/api';

const DocumentUpload = ({ businessId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('Other');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const documentTypes = ['BR', 'License', 'Certificate', 'Contract', 'Other'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
      
      // Auto-fill document name from filename if empty
      if (!documentName) {
        const name = selectedFile.name.split('.')[0];
        setDocumentName(name);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!documentName.trim()) {
      setError('Please enter document name');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('name', documentName);
      formData.append('type', documentType);

      const response = await api.post(
        `/business/${businessId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Reset form
      setFile(null);
      setDocumentName('');
      setDocumentType('Other');
      
      // Clear file input
      const fileInput = document.getElementById('document-upload');
      if (fileInput) fileInput.value = '';

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Name *
        </label>
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          className="input"
          placeholder="e.g., Business Registration Certificate"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Type *
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="input"
        >
          {documentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload File * (PDF, JPG, PNG, DOC - Max 10MB)
        </label>
        <input
          id="document-upload"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-primary-50 file:text-primary-700
            hover:file:bg-primary-100
            cursor-pointer"
          required
        />
        {file && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="btn btn-primary w-full"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
};

export default DocumentUpload;

