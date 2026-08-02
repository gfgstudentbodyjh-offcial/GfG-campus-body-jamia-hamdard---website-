import React, { useState, useEffect } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import api from '../../services/api';
import { Edit3, Trash2, X, Download } from 'lucide-react';

export default function ResourcesAdmin() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['All', 'DSA', 'Development', 'Placement', 'CP', 'Others'];

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'pdf',
    category: 'DSA'
  });

  useEffect(() => {
    loadResources();
  }, [categoryFilter]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resources', { params: { category: categoryFilter } });
      setResources(res.data.data || []);
    } catch (err) {
      console.warn(err);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setFormData({
      _id: '',
      title: '',
      description: '',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      category: 'DSA'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setFormData({
      _id: r._id,
      title: r.title || '',
      description: r.description || '',
      fileUrl: r.fileUrl || '',
      fileType: r.fileType || 'pdf',
      category: r.category || 'DSA'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/resources/${formData._id}`, formData);
      } else {
        await api.post('/resources', formData);
      }
      setIsModalOpen(false);
      loadResources();
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      loadResources();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <ContentCrudModule
        title="Learning Resources Vault"
        subtitle="Upload & categorize DSA cheat sheets, full-stack roadmaps & placement guides."
        items={resources}
        loading={loading}
        onAdd={handleOpenAdd}
        filterOptions={categories}
        activeFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        columns={['Resource Title', 'Category', 'Downloads', 'File Type']}
        renderRow={(r) => (
          <tr key={r._id} className="hover:bg-[#0d1117]/60 transition-colors">
            <td className="px-6 py-4">
              <div>
                <p className="font-bold text-white text-sm">{r.title}</p>
                <p className="text-[10px] text-gray-400 max-w-xs truncate">{r.description}</p>
              </div>
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-[#2f9e44]">{r.category}</td>
            <td className="px-6 py-4 text-xs text-gray-300">{r.downloadsCount || 0}</td>
            <td className="px-6 py-4 text-xs text-gray-400 uppercase font-mono">{r.fileType}</td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleOpenEdit(r)} className="p-2 rounded-lg bg-[#21262d] text-gray-300 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(r._id)} className="p-2 rounded-lg bg-[#21262d] text-red-400 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
            </td>
          </tr>
        )}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
              <h3 className="text-lg font-bold text-white">{formData._id ? 'Edit Resource' : 'Upload Resource'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">File Type</label>
                  <select
                    value={formData.fileType}
                    onChange={e => setFormData({ ...formData, fileType: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="notes">Notes</option>
                    <option value="ppt">PPT Slide</option>
                    <option value="video">Video Lecture</option>
                    <option value="link">Web Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">File or Download URL</label>
                <input
                  type="text"
                  required
                  value={formData.fileUrl}
                  onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-sm">
                Save Resource
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
