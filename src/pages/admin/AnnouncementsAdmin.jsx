import React, { useState, useEffect } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import api from '../../services/api';
import { Edit3, Trash2, X, Bell } from 'lucide-react';

export default function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    priority: 'High',
    status: 'Active'
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data || []);
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
      priority: 'High',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a) => {
    setFormData({
      _id: a._id,
      title: a.title || '',
      description: a.description || '',
      priority: a.priority || 'High',
      status: a.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/announcements/${formData._id}`, formData);
      } else {
        await api.post('/announcements', formData);
      }
      setIsModalOpen(false);
      loadAnnouncements();
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      loadAnnouncements();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <ContentCrudModule
        title="Announcements & Notices"
        subtitle="Manage ticker bar notices displayed on the public site."
        items={announcements}
        loading={loading}
        onAdd={handleOpenAdd}
        columns={['Announcement Headline', 'Priority Flag', 'Status']}
        renderRow={(a) => (
          <tr key={a._id} className="hover:bg-[#0d1117]/60 transition-colors">
            <td className="px-6 py-4">
              <div>
                <p className="font-bold text-white text-sm">{a.title}</p>
                <p className="text-[10px] text-gray-400 max-w-md truncate">{a.description}</p>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                a.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-[#2f9e44]/20 text-[#2f9e44]'
              }`}>
                {a.priority} Priority
              </span>
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-gray-300">{a.status}</td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleOpenEdit(a)} className="p-2 rounded-lg bg-[#21262d] text-gray-300 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(a._id)} className="p-2 rounded-lg bg-[#21262d] text-red-400 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
            </td>
          </tr>
        )}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
              <h3 className="text-lg font-bold text-white">{formData._id ? 'Edit Notice' : 'Post Announcement'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  placeholder="🚀 GeeksHack 2026 Registrations are Live!"
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
                  <label className="block text-gray-300 font-semibold mb-1">Priority Flag</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-sm">
                Publish Announcement
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
