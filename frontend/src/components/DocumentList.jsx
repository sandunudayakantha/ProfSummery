import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import api from '../utils/api';

const DocumentList = ({ documents, businessId, userRole, onDelete }) => {
  const [deleting, setDeleting] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

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

  // Function to handle viewing documents in modal
  const handleView = async (doc) => {
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(doc.fileType)) {
      // For images, fetch as blob and create blob URL
      try {
        const response = await fetch(doc.url);
        const blob = await response.blob();
        
        // Determine MIME type based on file extension
        const mimeTypes = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp'
        };
        const mimeType = mimeTypes[doc.fileType.toLowerCase()] || blob.type || 'image/jpeg';
        
        // Create a blob with the correct MIME type
        const imageBlob = new Blob([blob], { type: mimeType });
        const blobUrl = window.URL.createObjectURL(imageBlob);
        
        setImageUrl(blobUrl);
        setViewingDoc(doc);
      } catch (error) {
        console.error('View failed:', error);
        // Fallback: use direct URL
        setImageUrl(doc.url);
        setViewingDoc(doc);
      }
    } else {
      // For PDFs and other files, set the document to view
      setImageUrl(null);
      setViewingDoc(doc);
    }
  };

  // Function to close the viewer
  const handleCloseViewer = () => {
    // Clean up blob URL if it exists
    if (imageUrl && imageUrl.startsWith('blob:')) {
      window.URL.revokeObjectURL(imageUrl);
    }
    setViewingDoc(null);
    setImageUrl(null);
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Handle Escape key to close viewer
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && viewingDoc) {
        // Clean up blob URL if it exists
        if (imageUrl && imageUrl.startsWith('blob:')) {
          window.URL.revokeObjectURL(imageUrl);
        }
        setViewingDoc(null);
        setImageUrl(null);
      }
    };

    if (viewingDoc) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [viewingDoc, imageUrl]);

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
    <>
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

      {/* File Viewer Modal - Rendered via Portal */}
      {viewingDoc && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={handleCloseViewer}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            margin: 0,
            padding: 0
          }}
        >
          <div 
            className="relative bg-white shadow-2xl flex flex-col w-full h-full"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              width: '100vw',
              height: '100vh',
              maxWidth: '100vw',
              maxHeight: '100vh',
              margin: 0,
              borderRadius: 0
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10" style={{ flexShrink: 0 }}>
              <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">{viewingDoc.name}</h3>
              <button
                onClick={handleCloseViewer}
                className="flex-shrink-0 p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg"
                aria-label="Close"
                style={{ backgroundColor: '#ef4444' }}
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Content - Full Screen */}
            <div className="flex-1 overflow-auto flex items-center justify-center" style={{ 
              width: '100%',
              height: 'calc(100vh - 80px)',
              padding: '1rem'
            }}>
              {viewingDoc.fileType === 'pdf' ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewingDoc.url)}&embedded=true`}
                  className="w-full h-full border-0"
                  title={viewingDoc.name}
                  style={{ 
                    width: '100%',
                    height: '100%',
                    minHeight: 'calc(100vh - 80px)'
                  }}
                />
              ) : ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(viewingDoc.fileType) ? (
                <div className="flex items-center justify-center w-full h-full">
                  <img
                    src={imageUrl || viewingDoc.url}
                    alt={viewingDoc.name}
                    className="object-contain"
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: 'calc(100vh - 100px)',
                      width: 'auto',
                      height: 'auto'
                    }}
                    onError={(e) => {
                      console.error('Image failed to load');
                      e.target.src = viewingDoc.url;
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Preview not available for this file type.</p>
                    <button
                      onClick={() => handleDownload(viewingDoc)}
                      className="btn btn-primary"
                    >
                      Download to View
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default DocumentList;

