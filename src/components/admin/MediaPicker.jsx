import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Search, Check, Folder, X, UploadCloud } from 'lucide-react';
import api from '../../services/api';

export default function MediaPicker({ isOpen, onClose, onSelectMedia, currentFolder = 'General' }) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'upload'
  const [folder, setFolder] = useState(currentFolder);
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [uploadFile, setUploadFile] = useState(null);

  const folders = ['All', 'Faculty', 'Campus Mantri', 'Members', 'Teams', 'Events', 'Gallery', 'Resources', 'General'];

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, folder, search]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/media', { params: { folder: folder === 'All' ? '' : folder, search } });
      setAssets(res.data.data || []);
    } catch (err) {
      console.warn('Failed to load media assets from server:', err);
      // Fallback sample assets
      setAssets([
        { _id: 'a1', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80', filename: 'hackathon_banner.jpg', folder: 'Events' },
        { _id: 'a2', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80', filename: 'mantri_avatar.jpg', folder: 'Campus Mantri' },
        { _id: 'a3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', filename: 'faculty_advisor.jpg', folder: 'Faculty' },
        { _id: 'a4', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80', filename: 'team_meeting.jpg', folder: 'Gallery' }
      ]);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('mediaFile', uploadFile);
    formData.append('folder', folder === 'All' ? 'General' : folder);

    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newAsset = res.data.data;
      onSelectMedia(newAsset.url);
      onClose();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2f9e44]/20 border border-[#2f9e44]/30 flex items-center justify-center text-[#2f9e44]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Universal Media Picker</h3>
              <p className="text-xs text-gray-400">Select from Media Library or upload new asset to Cloudinary</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#21262d] text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#30363d] bg-[#0d1117]">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'library'
                ? 'border-[#2f9e44] text-[#2f9e44] bg-[#161b22]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Folder className="w-4 h-4" /> Media Library
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'border-[#2f9e44] text-[#2f9e44] bg-[#161b22]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Upload New File
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'library' ? (
            <div className="space-y-4">
              
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1">
                  {folders.map(f => (
                    <button
                      key={f}
                      onClick={() => setFolder(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        folder === f
                          ? 'bg-[#2f9e44] text-white'
                          : 'bg-[#21262d] text-gray-400 hover:text-white border border-[#30363d]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search media..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2f9e44]"
                  />
                </div>
              </div>

              {/* Media Asset Grid */}
              {loading ? (
                <div className="py-12 flex justify-center text-gray-400">Loading Media Library...</div>
              ) : assets.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">No assets found in folder "{folder}"</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {assets.map(item => (
                    <div
                      key={item._id}
                      onClick={() => setSelectedUrl(item.url)}
                      className={`group relative rounded-xl overflow-hidden border cursor-pointer aspect-square bg-[#0d1117] transition-all ${
                        selectedUrl === item.url
                          ? 'border-[#2f9e44] ring-2 ring-[#2f9e44]/50 scale-[0.98]'
                          : 'border-[#30363d] hover:border-gray-500'
                      }`}
                    >
                      <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                        <span className="text-[10px] text-white font-medium truncate">{item.filename}</span>
                        <span className="text-[9px] text-[#2f9e44]">{item.folder}</span>
                      </div>
                      {selectedUrl === item.url && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#2f9e44] text-white flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Upload Tab */
            <form onSubmit={handleFileUpload} className="max-w-md mx-auto space-y-6 py-6">
              <div className="border-2 border-dashed border-[#30363d] hover:border-[#2f9e44] rounded-2xl p-8 text-center bg-[#0d1117] transition-all">
                <CloudUpload className="w-12 h-12 text-[#2f9e44] mx-auto mb-3" />
                <p className="text-sm font-semibold text-white">Select image or media asset to upload</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP, MP4 supported up to 10MB</p>
                <input
                  type="file"
                  onChange={e => setUploadFile(e.target.files[0])}
                  className="mt-4 block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2f9e44] file:text-white hover:file:bg-[#238636] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Target Folder</label>
                <select
                  value={folder}
                  onChange={e => setFolder(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
                >
                  {folders.filter(f => f !== 'All').map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!uploadFile || uploading}
                className="w-full py-3 rounded-xl gradient-button font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploading ? 'Uploading to Cloudinary...' : 'Upload & Select Media'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {activeTab === 'library' && (
          <div className="p-4 border-t border-[#30363d] bg-[#0d1117] flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {selectedUrl ? 'Asset selected ready to insert' : 'Click on an asset to select'}
            </span>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white">
                Cancel
              </button>
              <button
                disabled={!selectedUrl}
                onClick={() => {
                  onSelectMedia(selectedUrl);
                  onClose();
                }}
                className="px-5 py-2 text-xs font-bold rounded-lg gradient-button disabled:opacity-40"
              >
                Confirm & Use Image
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
