import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import _ from "lodash";
import apiClient from "../utils/api";
import { API_ENDPOINTS } from "../utils/apiEndpoints";

function Home() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(API_ENDPOINTS.FILES);
      setFiles(_.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const upload = useCallback(async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }
    try {
      setUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);
      await apiClient.post(API_ENDPOINTS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFile(null);
      await fetchFiles();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  }, [file, fetchFiles]);

  const handleFileChange = useCallback((e) => {
    if (e && e.target && e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  }, []);

  const handleView = useCallback((fileId) => {
    if (fileId) {
      navigate(`/view/${fileId}`);
    }
  }, [navigate]);

  const handleDelete = useCallback(async (fileId, fileName) => {
    if (!fileId) return;
    
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      setError(null);
      await apiClient.delete(API_ENDPOINTS.DELETE(fileId));
      await fetchFiles();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete file");
    }
  }, [fetchFiles]);

  const hasFiles = useMemo(() => !_.isEmpty(files), [files]);

  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-blue-200 text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            📁 My Files
          </h1>
          <p className="text-gray-600">Upload and manage your files</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Upload New File</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}
          <form onSubmit={upload} className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <div className="flex items-center justify-center w-full h-12 px-4 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                  <span className="text-blue-600 font-medium">
                    {file ? `Selected: ${file.name}` : "Choose a file"}
                  </span>
                </div>
              </label>
              <button 
                type="submit"
                disabled={uploading || !file}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  "📤 Upload"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <h2 className="text-xl font-semibold text-white">Your Files</h2>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading files...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {!hasFiles ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📂</div>
                  <p className="text-gray-500 text-lg">No files uploaded yet</p>
                  <p className="text-gray-400 text-sm mt-2">Upload your first file above</p>
                </div>
              ) : (
                files.map((f) => {
                  if (!f || !f._id) return null;
                  const baseUrl = apiClient.defaults.baseURL;
                  const downloadUrl = baseUrl.startsWith('http') 
                    ? `${baseUrl}${API_ENDPOINTS.DOWNLOAD(f._id)}`
                    : `${API_ENDPOINTS.DOWNLOAD(f._id)}`;
                  return (
                    <div key={f._id} className="p-4 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-medium truncate">{f.originalname || "Unknown file"}</p>
                          <p className="text-sm text-gray-500 mt-1">{formatFileSize(f.size)}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <button 
                            onClick={() => handleView(f._id)} 
                            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            👁️ View
                          </button>
                          <a 
                            href={downloadUrl} 
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            download
                          >
                            ⬇️ Download
                          </a>
                          <button 
                            onClick={() => handleDelete(f._id, f.originalname)} 
                            className="p-2.5 bg-red-500 hover:bg-red-600 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
                            title="Delete file"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="w-5 h-5"
                            >
                              {/* Trash can lid/cover with white horizontal lines */}
                              <rect x="6" y="4" width="12" height="3" rx="0.5" fill="white" opacity="0.25" />
                              <line x1="7" y1="5" x2="17" y2="5" stroke="white" strokeWidth="1" />
                              <line x1="7" y1="6" x2="17" y2="6" stroke="white" strokeWidth="1" />
                              
                              {/* Trash can body */}
                              <path d="M3 6h18M5 6V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Made by <span className="font-semibold text-blue-600">Mukesh Anand</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;