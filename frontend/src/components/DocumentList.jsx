import { useState } from 'react';
import api from '../utils/api';

const DocumentList = ({ documents, businessId, userRole, onDelete }) => {
  const [deleting, setDeleting] = useState(null);

  const canDelete = userRole === 'owner' || userRole === 'editor';

  // Function to handle file download
  const handleDownload = async (doc) => {
    try {
      // Fetch the file
      const response = await fetch(doc.url);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename
      const extension = doc.fileType || 'file';
      link.download = `${doc.name}.${extension}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(doc.url, '_blank');
    }
  };

  // Function to handle viewing documents (especially PDFs)
  const handleView = (doc) => {
    if (doc.fileType === 'pdf') {
      // For PDFs, use Google Docs Viewer to display inline
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(doc.url)}&embedded=true`;
      window.open(googleDocsUrl, '_blank');
    } else {
      // For images and other files, open directly
      window.open(doc.url, '_blank');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeleting(documentId);
    try {
      await api.delete(`/business/${businessId}/documents/${documentId}`);
      if (onDelete) {
        onDelete(documentId);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) return '🖼️';
    if (['doc', 'docx'].includes(fileType)) return '📝';
    return '📎';
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      'BR': 'bg-purple-100 text-purple-800',
      'License': 'bg-blue-100 text-blue-800',
      'Certificate': 'bg-green-100 text-green-800',
      'Contract': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['Other'];
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📁</div>
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc._id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className="text-3xl">{getFileIcon(doc.fileType)}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                <span className={`badge ${getDocumentTypeColor(doc.type)}`}>
                  {doc.type}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Uploaded by {doc.uploadedBy?.name} on{' '}
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleView(doc)}
              className="btn btn-secondary text-sm"
            >
              View
            </button>
            <button
              onClick={() => handleDownload(doc)}
              className="btn btn-secondary text-sm"
            >
              Download
            </button>
            {canDelete && (
              <button
                onClick={() => handleDelete(doc._id)}
                disabled={deleting === doc._id}
                className="btn btn-danger text-sm"
              >
                {deleting === doc._id ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;

