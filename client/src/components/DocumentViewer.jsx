import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  ExternalLink, 
  Loader2, 
  AlertTriangle,
  File
} from 'lucide-react';

const DocumentViewer = ({ fileId, fileName, alternateLink }) => {
  const [documentContent, setDocumentContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!fileId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `http://localhost:3000/api/drive/files/${fileId}/content`,
          { withCredentials: true }
        );
        
        if (response.data && response.data.content) {
          setDocumentContent(response.data.content);
        } else {
          setError('Invalid document content received');
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [fileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
          <p className="mt-2 text-purple-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3 text-red-600">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold">Error loading document</h3>
            <p className="text-red-600/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{fileName}</h2>
        </div>
        
        <a
          href={alternateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
            border-2 border-purple-200 text-purple-700 font-medium
            hover:bg-purple-50 hover:border-purple-300 transition-colors"
        >
          <span>Open in Google Docs</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Document Content */}
      {documentContent ? (
        <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm text-gray-800
          whitespace-pre-wrap max-h-[500px] overflow-y-auto border border-gray-200
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {documentContent}
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-600">
            This document cannot be previewed. Please open it in Google Docs.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer; 