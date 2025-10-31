import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../utils/api";
import { API_ENDPOINTS } from "../utils/apiEndpoints";
import { processFileContent } from "../utils/contentRenderer";

function ViewFile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fileData, setFileData] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFileMetadata = useCallback(async () => {
    if (!id) return null;
    try {
      const res = await apiClient.get(API_ENDPOINTS.FILES);
      if (res && res.data && Array.isArray(res.data)) {
        const file = res.data.find(f => f._id === id);
        return file || null;
      }
    } catch (err) {
      console.error("Failed to fetch file metadata:", err);
    }
    return null;
  }, [id]);

  const fetchFileContent = useCallback(async () => {
    if (!id) {
      setError("Invalid file ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // get metadata and content at the same time
      const [metadata, contentRes] = await Promise.all([
        fetchFileMetadata(),
        apiClient.get(API_ENDPOINTS.VIEW(id), { responseType: 'blob' }),
      ]);

      setFileMetadata(metadata);

      if (contentRes && contentRes.data) {
        const contentType = contentRes.headers['content-type'] || '';
        const processed = await processFileContent(contentRes.data, contentType);
        setFileData(processed);
      } else {
        setFileData({
          renderType: 'text',
          content: "No content available",
        });
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Cannot preview this file type";
      setError(errorMessage);
      setFileData({
        renderType: 'text',
        content: "Cannot preview this file type",
      });
    } finally {
      setLoading(false);
    }
  }, [id, fetchFileMetadata]);

  useEffect(() => {
    fetchFileContent();
    
    // Cleanup blob URL on unmount
    return () => {
      if (fileData?.blobUrl) {
        URL.revokeObjectURL(fileData.blobUrl);
      }
    };
  }, [fetchFileContent]);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleDownload = useCallback(() => {
    if (!id || !fileMetadata) return;
    const baseUrl = apiClient.defaults.baseURL;
    const downloadUrl = baseUrl.startsWith('http') 
      ? `${baseUrl}${API_ENDPOINTS.DOWNLOAD(id)}`
      : `${API_ENDPOINTS.DOWNLOAD(id)}`;
    window.location.href = downloadUrl;
  }, [id, fileMetadata]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-gray-600">Loading file content...</p>
        </div>
      </div>
    );
  }

  // Render component based on file type
  const renderContent = () => {
    if (!fileData) return null;

    const { renderType, blobUrl, content } = fileData;
    const containerClass = "bg-gray-100 p-4 rounded";

    const renderers = {
      image: () => (
        <div className="p-8 bg-gray-50 flex items-center justify-center min-h-[60vh]">
          <img 
            src={blobUrl} 
            alt="Preview" 
            className="max-w-full max-h-[75vh] rounded-lg shadow-lg"
            style={{ display: 'block' }}
          />
        </div>
      ),
      pdf: () => (
        <div className="p-4 bg-gray-50" style={{ minHeight: '75vh' }}>
          <iframe 
            src={blobUrl} 
            className="w-full h-[75vh] rounded-lg shadow-md border-0"
            title="PDF Preview"
          />
        </div>
      ),
      video: () => (
        <div className="p-8 bg-gray-50 flex items-center justify-center">
          <video controls className="w-full max-w-4xl max-h-[75vh] rounded-lg shadow-lg">
            <source src={blobUrl} />
            Your browser does not support the video tag.
          </video>
        </div>
      ),
      audio: () => (
        <div className="p-8 bg-gray-50 flex items-center justify-center">
          <audio controls className="w-full max-w-2xl">
            <source src={blobUrl} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      ),
      text: () => (
        <div className="p-6 bg-gray-900">
          <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto max-h-[75vh] font-mono text-sm">
            {content || "No content to display"}
          </pre>
        </div>
      ),
      binary: () => (
        <div className="p-8 bg-gray-50 text-center">
          <p className="text-gray-600 text-lg">{content}</p>
        </div>
      ),
    };

    const renderer = renderers[renderType] || renderers.binary;
    return renderer();
  };

  const downloadUrl = fileMetadata && id ? 
    (apiClient.defaults.baseURL.startsWith('http') 
      ? `${apiClient.defaults.baseURL}${API_ENDPOINTS.DOWNLOAD(id)}`
      : `${API_ENDPOINTS.DOWNLOAD(id)}`) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={handleBack} 
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              ← Back to Files
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                👁️ View
              </button>
              {downloadUrl && (
                <a 
                  href={downloadUrl}
                  download
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  ⬇️ Download
                </a>
              )}
            </div>
          </div>
          {fileMetadata && (
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{fileMetadata.originalname || "File Preview"}</h1>
              {fileMetadata.size && (
                <p className="text-sm text-gray-600">
                  {fileMetadata.size < 1024 
                    ? `${fileMetadata.size} B` 
                    : fileMetadata.size < 1024 * 1024
                    ? `${(fileMetadata.size / 1024).toFixed(2)} KB`
                    : `${(fileMetadata.size / (1024 * 1024)).toFixed(2)} MB`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Content preview */}
        <div className="bg-white rounded-2xl shadow-xl border border-yellow-200 overflow-hidden">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Made by <span className="font-semibold text-yellow-600">Mukesh Anand</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ViewFile;