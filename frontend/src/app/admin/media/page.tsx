'use client';

import { useState, useEffect } from 'react';
import { FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';
import api from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  created_at: number;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get('/uploads/media.php', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia(res.data.media || []);
    } catch (err) {
      console.error('Failed to fetch media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    fetchMedia();
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this media file?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete('/uploads/media.php', {
        data: { filename },
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMedia();
    } catch (err) {
      console.error('Failed to delete media:', err);
      alert('Failed to delete media file');
    }
  };

  const handleCopy = (url: string) => {
    copyToClipboard(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Media Library</h1>
          <p className="text-gray-600">Manage your uploaded images</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 border-r border-gray-200 pr-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New</h2>
            <ImageUpload 
              onUploadComplete={handleUploadComplete} 
              label="Select an image" 
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b4d8]"></div>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
              <p className="text-gray-500">No media uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((file) => (
                <div key={file.filename} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                      <button
                        onClick={() => handleCopy(file.url)}
                        className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                        title="Copy URL"
                      >
                        {copiedUrl === file.url ? <FiCheck className="w-5 h-5 text-green-600" /> : <FiCopy className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(file.filename)}
                        className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete Image"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                      <span>{new Date(file.created_at * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
