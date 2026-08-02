import React, { useState, useEffect } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import MediaPicker from '../../components/admin/MediaPicker';
import api from '../../services/api';
import { Edit3, Trash2, Image as ImageIcon, Star, X } from 'lucide-react';

export default function GalleryAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [albumFilter, setAlbumFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const albums = ['All', 'Hackathons', 'Workshops', 'Orientation', 'General'];

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    album: 'Hackathons',
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

  const handleOpenAdd = () => {
    setFormData({
      _id: '',
      title: '',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      album: 'Hackathons',
      isFeatured: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g) => {
    setFormData({
      _id: g._id,
      title: g.title || '',
      url: g.url || '',
      album: g.album || 'Hackathons',
      isFeatured: g.isFeatured || false
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete item?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      loadItems();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <ContentCrudModule
        title="Gallery Asset Manager"
        subtitle="Manage photo/video uploads and toggle homepage featured spotlights."
        items={items}
        loading={loading}
        onAdd={handleOpenAdd}
        filterOptions={albums}
        activeFilter={albumFilter}
        onFilterChange={setAlbumFilter}
        columns={['Media Preview', 'Title', 'Album Category', 'Featured Spotlight']}
        renderRow={(g) => (
          <tr key={g._id} className="hover:bg-[#0d1117]/60 transition-colors">
            <td className="px-6 py-4">
              <img src={g.url} alt={g.title} className="w-16 h-12 rounded-lg object-cover border border-[#30363d]" />
            </td>
            <td className="px-6 py-4 font-bold text-white text-sm">{g.title}</td>
            <td className="px-6 py-4 text-xs text-gray-300">{g.album}</td>
            <td className="px-6 py-4">
              {g.isFeatured ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30 flex items-center gap-1 w-fit">
                  <Star className="w-3 h-3 fill-[#2f9e44]" /> Featured on Home
                </span>
              ) : (
                <span className="text-xs text-gray-500">Standard</span>
              )}
            </td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleOpenEdit(g)} className="p-2 rounded-lg bg-[#21262d] text-gray-300 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(g._id)} className="p-2 rounded-lg bg-[#21262d] text-red-400 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
            </td>
          </tr>
        )}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
              <h3 className="text-lg font-bold text-white">{formData._id ? 'Edit Media Asset' : 'Add Gallery Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Image / Media URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3 py-2 rounded-lg bg-[#21262d] text-gray-200 border border-[#30363d] flex items-center gap-1 font-semibold"
                  >
                    <ImageIcon className="w-4 h-4 text-[#2f9e44]" /> Pick Media
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Asset Caption Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Album Category</label>
                <select
                  value={formData.album}
                  onChange={e => setFormData({ ...formData, album: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
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
                <label htmlFor="isFeatured" className="text-gray-300 font-semibold cursor-pointer">
                  Feature this item on Public Homepage Gallery
                </label>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-sm">
                Save Gallery Asset
              </button>
            </form>
          </div>
        </div>
      )}

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={(url) => setFormData(prev => ({ ...prev, url }))}
        currentFolder="Gallery"
      />

    </div>
  );
}
