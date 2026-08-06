import React, { useState, useEffect, useRef } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import api from '../../services/api';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { Edit3, Trash2, Camera, Star, X, UploadCloud, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function GalleryAdmin() {
  const { isLight } = useAdminTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [albumFilter, setAlbumFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // File Input Ref for native multi-image picker
  const multiFileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [targetAlbum, setTargetAlbum] = useState('Campus Activities');

  const albums = ['All', 'Event Gallery', 'Community Gallery', 'Hackathons', 'Workshops', 'Meetups', 'Campus Activities'];

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    url: '',
    album: 'Campus Activities',
    category: 'Hackathon',
    isFeatured: true
  });

  useEffect(() => {
    loadItems();
  }, [albumFilter]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gallery', { params: { album: albumFilter } });
      setItems(res.data.data || []);
    } catch (err) {
      console.warn(err);
    }
    setLoading(false);
  };

  const filteredItems = items.filter(g => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (g.title && g.title.toLowerCase().includes(term)) ||
      (g.album && g.album.toLowerCase().includes(term))
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      _id: '',
      title: '',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      album: 'Campus Activities',
      category: 'Workshops',
      isFeatured: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g) => {
    setFormData({
      _id: g._id,
      title: g.title || '',
      url: g.url || '',
      album: g.album || 'Campus Activities',
      category: g.category || 'Workshops',
      isFeatured: g.isFeatured || false
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/gallery/${formData._id}`, formData);
      } else {
        await api.post('/gallery', formData);
      }
      setIsModalOpen(false);
      loadItems();
    } catch (err) {
      alert('Save failed');
    }
  };

  // Native Multi-File Select Handler
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    const fileObjects = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setSelectedFiles(prev => [...prev, ...fileObjects]);
  };

  const handleRemoveFilePreview = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBatchUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setUploadProgress(true);

    try {
      // 1. Upload files to backend media API
      const uploadedDocs = [];
      for (const item of selectedFiles) {
        const body = new FormData();
        body.append('file', item.file);
        body.append('type', 'image');

        const res = await api.post('/media/upload', body, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const imgUrl = res.data?.url || item.preview;
        uploadedDocs.push({
          title: item.name.replace(/\.[^/.]+$/, ''),
          url: imgUrl,
          album: targetAlbum,
          category: 'Community',
          isFeatured: true
        });
      }

      // 2. Insert batch gallery documents
      await api.post('/gallery/batch', { items: uploadedDocs });
      alert(`Successfully uploaded ${uploadedDocs.length} photos to "${targetAlbum}" album!`);
      setSelectedFiles([]);
      setIsUploadModalOpen(false);
      loadItems();
    } catch (err) {
      alert('Batch upload error: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete gallery photo permanently?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      loadItems();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Native Multi-File Picker Hidden */}
      <input
        type="file"
        ref={multiFileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFilesSelected}
      />

      {/* Header Bar Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl gradient-button text-xs font-bold flex items-center gap-2 shadow-md"
        >
          <UploadCloud className="w-4 h-4" /> Upload Multiple Photos
        </button>
      </div>

      <ContentCrudModule
        title="Gallery Manager"
        subtitle="Upload multiple photos from your device, organize event memory albums, and manage featured homepage gallery spotlights."
        items={filteredItems}
        loading={loading}
        onAdd={handleOpenAdd}
        filterOptions={albums}
        activeFilter={albumFilter}
        onFilterChange={setAlbumFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        columns={['Media Preview', 'Asset Title', 'Album Category', 'Spotlight Status', 'Actions']}
        renderRow={(g) => (
          <tr key={g._id} className={`transition-colors ${
            isLight ? 'hover:bg-slate-50/80 border-b border-gray-200' : 'hover:bg-[#0d1117]/60 border-b border-[#30363d]'
          }`}>
            <td className="px-6 py-4">
              <img
                src={g.url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80'}
                alt={g.title}
                className="w-16 h-12 rounded-lg object-cover border flex-shrink-0 shadow-sm"
              />
            </td>
            <td className={`px-6 py-4 font-bold text-xs sm:text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>{g.title}</td>
            <td className={`px-6 py-4 text-xs font-mono font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>{g.album}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {g.isFeatured ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30 inline-flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#2f9e44]" /> Featured Spotlight
                </span>
              ) : (
                <span className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Standard</span>
              )}
            </td>
            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
              <button
                onClick={() => handleOpenEdit(g)}
                className={`p-2 rounded-lg border transition-colors ${
                  isLight ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' : 'bg-[#21262d] text-gray-300 border-[#30363d] hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(g._id)}
                className={`p-2 rounded-lg border transition-colors ${
                  isLight ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-[#21262d] text-red-400 border-[#30363d] hover:bg-red-500/20'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        )}
      />

      {/* MULTIPLE PHOTO UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`rounded-2xl border w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl transition-colors ${
            isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#161b22] border-[#30363d] text-white'
          }`}>
            <div className={`flex justify-between items-center border-b pb-4 ${isLight ? 'border-gray-200' : 'border-[#30363d]'}`}>
              <div>
                <h3 className={`text-lg font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Batch Upload Photos</h3>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Select multiple memory photos from your device.</p>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className={isLight ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Target Album</label>
                <select
                  value={targetAlbum}
                  onChange={e => setTargetAlbum(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 border text-xs font-semibold focus:outline-none focus:border-[#2f9e44] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                  }`}
                >
                  {albums.filter(a => a !== 'All').map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Native Dropzone */}
              <div
                onClick={() => multiFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  isLight ? 'border-gray-300 bg-slate-50 hover:border-[#2f9e44]' : 'border-[#30363d] bg-[#0d1117] hover:border-[#2f9e44]'
                }`}
              >
                <UploadCloud className="w-10 h-10 text-[#2f9e44] mx-auto mb-2" />
                <p className={`text-xs font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Click to Select Multiple Photos</p>
                <p className={`text-[10px] mt-0.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>PNG, JPG, WEBP formats supported</p>
              </div>

              {/* Preview Grid */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <span className={`text-xs font-bold block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                    Selected Photos ({selectedFiles.length})
                  </span>
                  <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                    {selectedFiles.map((item, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-[#30363d]">
                        <img src={item.preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveFilePreview(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={selectedFiles.length === 0 || uploadProgress}
                onClick={handleBatchUploadSubmit}
                className="w-full py-3 rounded-xl gradient-button font-bold text-xs shadow-lg disabled:opacity-50"
              >
                {uploadProgress ? `Uploading ${selectedFiles.length} Photos to Cloudinary...` : `Upload ${selectedFiles.length} Photos to Album`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Single Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`rounded-2xl border w-full max-w-lg p-6 space-y-4 shadow-2xl transition-colors ${
            isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#161b22] border-[#30363d] text-white'
          }`}>
            <div className={`flex justify-between items-center border-b pb-4 ${isLight ? 'border-gray-200' : 'border-[#30363d]'}`}>
              <h3 className={`text-lg font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {formData._id ? 'Edit Photo Details' : 'Add Single Photo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className={isLight ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs font-medium">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Asset Caption Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. CodeMania Opening Ceremony"
                  className={`w-full rounded-xl px-3 py-2 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Album Category</label>
                <select
                  value={formData.album}
                  onChange={e => setFormData({ ...formData, album: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                  }`}
                >
                  {albums.filter(a => a !== 'All').map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-[#2f9e44]"
                />
                <label htmlFor="isFeatured" className={`font-semibold cursor-pointer ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  Feature on Public Homepage Showcase
                </label>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-xs shadow-lg">
                Save Photo Details
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
