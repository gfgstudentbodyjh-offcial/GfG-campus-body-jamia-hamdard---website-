import React, { useState, useEffect, useRef } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import api from '../../services/api';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { formatEventDate } from '../../utils/dateUtils';
import { Edit3, Trash2, X, Download, FileText, Link as LinkIcon, UploadCloud, Lock, Globe } from 'lucide-react';

export default function ResourcesAdmin() {
  const { isLight } = useAdminTheme();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const pdfInputRef = useRef(null);

  const categories = ['All', 'DSA', 'Development', 'Placement', 'Interview', 'Roadmaps', 'Notes', 'Other'];

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    fileUrl: '',
    resourceType: 'PDF',
    category: 'DSA',
    access: 'Public',
    tags: 'DSA, Arrays',
    status: 'Published'
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

  const filteredResources = resources.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(term)) ||
      (r.category && r.category.toLowerCase().includes(term)) ||
      (r.tags && Array.isArray(r.tags) && r.tags.some(t => t.toLowerCase().includes(term)))
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      _id: '',
      title: '',
      description: '',
      fileUrl: '',
      resourceType: 'PDF',
      category: 'DSA',
      access: 'Public',
      tags: 'DSA, Arrays',
      status: 'Published'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setFormData({
      _id: r._id,
      title: r.title || '',
      description: r.description || '',
      fileUrl: r.fileUrl || '',
      resourceType: r.resourceType || 'PDF',
      category: r.category || 'DSA',
      access: r.access || 'Public',
      tags: Array.isArray(r.tags) ? r.tags.join(', ') : r.tags || '',
      status: r.status || 'Published'
    });
    setIsModalOpen(true);
  };

  const handlePdfFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    const body = new FormData();
    body.append('file', file);
    body.append('type', 'raw');

    try {
      const res = await api.post('/media/upload', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const pdfUrl = res.data?.url || '';
      setFormData(prev => ({ ...prev, fileUrl: pdfUrl }));
      alert('PDF uploaded successfully!');
    } catch (err) {
      alert('PDF upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.fileUrl && formData.resourceType === 'PDF') {
      alert('Please upload a PDF file from your device first.');
      return;
    }
    if (!formData.fileUrl && (formData.resourceType === 'Link' || formData.resourceType === 'Video')) {
      alert('Please provide a valid Resource URL.');
      return;
    }

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      if (formData._id) {
        await api.put(`/resources/${formData._id}`, payload);
      } else {
        await api.post('/resources', payload);
      }
      setIsModalOpen(false);
      loadResources();
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete learning resource permanently?')) return;
    try {
      await api.delete(`/resources/${id}`);
      loadResources();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hidden PDF Upload Input */}
      <input
        type="file"
        ref={pdfInputRef}
        className="hidden"
        accept="application/pdf"
        onChange={handlePdfFileChange}
      />

      <ContentCrudModule
        title="Resources Manager"
        subtitle="Manage learning materials, DSA cheat sheets, roadmaps, and interview question vaults for the GFG Campus community."
        items={filteredResources}
        loading={loading}
        onAdd={handleOpenAdd}
        filterOptions={categories}
        activeFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        columns={['Resource Title', 'Category & Type', 'Access Level', 'Downloads', 'Status', 'Actions']}
        renderRow={(r) => (
          <tr key={r._id} className={`transition-colors ${
            isLight ? 'hover:bg-slate-50/80 border-b border-gray-200' : 'hover:bg-[#0d1117]/60 border-b border-[#30363d]'
          }`}>
            <td className="px-6 py-4">
              <div className="space-y-0.5">
                <p className={`font-bold text-xs sm:text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>{r.title}</p>
                <p className={`text-[10px] max-w-xs truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{r.description}</p>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#2f9e44] block">{r.category}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-semibold uppercase">
                  {r.resourceType || 'PDF'}
                </span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {r.access === 'Members Only' ? (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 flex items-center gap-1 w-fit">
                  <Lock className="w-3 h-3" /> Members Only
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 flex items-center gap-1 w-fit">
                  <Globe className="w-3 h-3" /> Public
                </span>
              )}
            </td>
            <td className={`px-6 py-4 text-xs font-mono font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{r.downloadsCount || 0}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                r.status === 'Published'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#2f9e44]/20 dark:text-[#2f9e44] dark:border-[#2f9e44]/30'
                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {r.status || 'Published'}
              </span>
            </td>
            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
              <button
                onClick={() => handleOpenEdit(r)}
                className={`p-2 rounded-lg border transition-colors ${
                  isLight ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' : 'bg-[#21262d] text-gray-300 border-[#30363d] hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(r._id)}
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

      {/* CREATE / EDIT RESOURCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className={`rounded-2xl border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl transition-colors ${
            isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#161b22] border-[#30363d] text-white'
          }`}>
            <div className={`flex justify-between items-center border-b pb-4 ${isLight ? 'border-gray-200' : 'border-[#30363d]'}`}>
              <h3 className={`text-lg font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {formData._id ? 'Edit Resource' : 'Add New Learning Resource'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className={isLight ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-medium">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete DSA Roadmap 2026"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summary of learning material contents..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full rounded-xl p-3 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 border text-xs font-semibold focus:outline-none focus:border-[#2f9e44] ${
                      isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                    }`}
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Resource Type</label>
                  <select
                    value={formData.resourceType}
                    onChange={e => setFormData({ ...formData, resourceType: e.target.value, fileUrl: '' })}
                    className={`w-full rounded-xl px-3 py-2 border text-xs font-semibold focus:outline-none focus:border-[#2f9e44] ${
                      isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                    }`}
                  >
                    <option value="PDF">PDF File</option>
                    <option value="Link">Web Link</option>
                    <option value="Video">Video Link</option>
                    <option value="Document">Document</option>
                  </select>
                </div>
              </div>

              {/* PDF FILE UPLOD vs EXTERNAL LINK */}
              {formData.resourceType === 'PDF' ? (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-gray-200' : 'bg-[#0d1117] border-[#30363d]'
                }`}>
                  <label className={`block font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Upload PDF File from Device</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={uploadingPdf}
                      onClick={() => pdfInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl gradient-button text-xs font-bold flex items-center gap-2 shadow"
                    >
                      <UploadCloud className="w-4 h-4" /> {uploadingPdf ? 'Uploading PDF...' : 'Select PDF File'}
                    </button>
                    {formData.fileUrl && (
                      <span className="text-[10px] font-mono text-[#2f9e44] font-bold truncate">✓ PDF Ready</span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Resource URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://geeksforgeeks.org/... or https://youtube.com/..."
                    value={formData.fileUrl}
                    onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                      isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                    }`}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Access Control</label>
                  <select
                    value={formData.access}
                    onChange={e => setFormData({ ...formData, access: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 border text-xs font-semibold focus:outline-none focus:border-[#2f9e44] ${
                      isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                    }`}
                  >
                    <option value="Public">Public Access</option>
                    <option value="Members Only">Members Only 🔒</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Publication Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 border text-xs font-semibold focus:outline-none focus:border-[#2f9e44] ${
                      isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                    }`}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="DSA, Arrays, Graphs, System Design"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                  }`}
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-xs shadow-lg">
                Save Learning Resource
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
