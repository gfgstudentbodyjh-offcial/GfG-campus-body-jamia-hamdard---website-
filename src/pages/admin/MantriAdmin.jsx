import React, { useState, useEffect } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import api from '../../services/api';
import { ShieldCheck, Edit3, Trash2, X, Check } from 'lucide-react';

export default function MantriAdmin() {
  const [mantris, setMantris] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    memberRef: '',
    session: '2025 - 2026',
    startDate: new Date().toISOString().split('T')[0],
    about: '',
    achievements: 'Hosted 12+ Workshops, 1,500+ Attendees',
    isCurrent: false,
    status: 'Active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, memRes] = await Promise.all([
        api.get('/mantri'),
        api.get('/members')
      ]);
      setMantris(mRes.data.data || []);
      setMembers(memRes.data.data || []);
    } catch (err) {
      console.warn(err);
    }
    setLoading(false);
  };

  const handleSetCurrent = async (id) => {
    try {
      await api.patch(`/mantri/${id}/set-current`);
      loadData();
    } catch (err) {
      alert('Set current mantri failed');
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      _id: '',
      memberRef: members[0]?._id || '',
      session: '2025 - 2026',
      startDate: new Date().toISOString().split('T')[0],
      about: '',
      achievements: 'Increased membership by 200%',
      isCurrent: false,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setFormData({
      _id: m._id,
      memberRef: m.memberRef?._id || m.memberRef || '',
      session: m.session || '',
      startDate: m.startDate ? new Date(m.startDate).toISOString().split('T')[0] : '',
      about: m.about || '',
      achievements: Array.isArray(m.achievements) ? m.achievements.join(', ') : m.achievements || '',
      isCurrent: m.isCurrent || false,
      status: m.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      achievements: formData.achievements.split(',').map(a => a.trim()).filter(Boolean)
    };

    try {
      if (formData._id) {
        await api.put(`/mantri/${formData._id}`, payload);
      } else {
        await api.post('/mantri', payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete entry?')) return;
    try {
      await api.delete(`/mantri/${id}`);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <ContentCrudModule
        title="Campus Mantri Timeline"
        subtitle="Manage session history. Click 'Set Current Mantri' to spotlight serving mantri on homepage."
        items={mantris}
        loading={loading}
        onAdd={handleOpenAdd}
        columns={['Campus Mantri', 'Session', 'Current Status', 'Action Toggle']}
        renderRow={(m) => (
          <tr key={m._id} className="hover:bg-[#0d1117]/60 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img src={m.memberRef?.photo} alt={m.memberRef?.name} className="w-10 h-10 rounded-full object-cover border border-[#2f9e44]" />
                <span className="font-bold text-white text-sm">{m.memberRef?.name || 'Campus Mantri'}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-gray-300">{m.session}</td>
            <td className="px-6 py-4">
              {m.isCurrent ? (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#2f9e44] text-white flex items-center gap-1 w-fit shadow-md">
                  <ShieldCheck className="w-3 h-3" /> Current Mantri
                </span>
              ) : (
                <span className="text-xs text-gray-500">Past Mantri</span>
              )}
            </td>
            <td className="px-6 py-4 space-x-2">
              {!m.isCurrent && (
                <button
                  onClick={() => handleSetCurrent(m._id)}
                  className="px-3 py-1 rounded-lg bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30 text-xs font-bold hover:bg-[#2f9e44] hover:text-white transition-all"
                >
                  Set Current
                </button>
              )}
            </td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleOpenEdit(m)} className="p-2 rounded-lg bg-[#21262d] text-gray-300 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(m._id)} className="p-2 rounded-lg bg-[#21262d] text-red-400 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
            </td>
          </tr>
        )}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
              <h3 className="text-lg font-bold text-white">{formData._id ? 'Edit Mantri Record' : 'Add Campus Mantri'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Select Mantri Profile (Member Ref)</label>
                <select
                  value={formData.memberRef}
                  onChange={e => setFormData({ ...formData, memberRef: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                >
                  <option value="">Select Member...</option>
                  {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Session Year</label>
                  <input
                    type="text"
                    required
                    placeholder="2025 - 2026"
                    value={formData.session}
                    onChange={e => setFormData({ ...formData, session: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Mantri Session Summary</label>
                <textarea
                  rows={3}
                  required
                  value={formData.about}
                  onChange={e => setFormData({ ...formData, about: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Key Achievements (comma separated)</label>
                <input
                  type="text"
                  value={formData.achievements}
                  onChange={e => setFormData({ ...formData, achievements: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onChange={e => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="w-4 h-4 accent-[#2f9e44]"
                />
                <label htmlFor="isCurrent" className="text-gray-300 font-semibold cursor-pointer">
                  Mark as Current Serving Campus Mantri
                </label>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-sm">
                Save Campus Mantri Entry
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
