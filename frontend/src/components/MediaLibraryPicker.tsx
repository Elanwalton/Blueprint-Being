'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiImage } from 'react-icons/fi';
import api from '@/lib/api';

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  created_at: number;
}

interface MediaLibraryPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaLibraryPicker({ onSelect, onClose }: MediaLibraryPickerProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/uploads/media.php', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedia(res.data.media || []);
      } catch (err) {
        console.error('Failed to load media library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] flex items-center justify-center">
              <FiImage className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-display font-bold text-gray-900">Media Library</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B1E1E]" />
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <FiImage className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">No images uploaded yet. Upload images via the Media library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((file) => {
                const isSelected = selected === file.url;
                return (
                  <button
                    key={file.filename}
                    type="button"
                    onClick={() => setSelected(file.url)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                      isSelected
                        ? 'border-[#8B1E1E] ring-2 ring-[#8B1E1E]/30 scale-[0.98]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#8B1E1E]/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#8B1E1E] flex items-center justify-center shadow-lg">
                          <FiCheck className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{file.filename}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-sm text-gray-500">
            {selected ? '1 image selected' : 'Click an image to select it'}
          </p>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use Selected Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
