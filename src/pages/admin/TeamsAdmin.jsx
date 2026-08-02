import React, { useState, useEffect } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import api from '../../services/api';
import { Edit3, Trash2, X } from 'lucide-react';

export default function TeamsAdmin() {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    icon: 'Code2',
    description: '',
    leadRef: '',
    coLeadRef: '',
    displayOrder: 1,
    status: 'Active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teamsRes, membersRes] = await Promise.all([
        api.get('/teams'),
        api.get('/members')
      ]);
      setTeams(teamsRes.data.data || []);
      setMembers(membersRes.data.data || []);
    } catch (err) {
      console.warn(err);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setFormData({
      _id: '',
      name: '',
      icon: 'Code2',
      description: '',
      leadRef: members[0]?._id || '',
      coLeadRef: members[1]?._id || '',
      displayOrder: teams.length + 1,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setFormData({
      _id: t._id,
      name: t.name,
      icon: t.icon || 'Code2',
      description: t.description || '',
      leadRef: t.leadRef?._id || t.leadRef || '',
      coLeadRef: t.coLeadRef?._id || t.coLeadRef || '',
      displayOrder: t.displayOrder || 1,
      status: t.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/teams/${formData._id}`, formData);
      } else {
        await api.post('/teams', formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Save team failed: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete team?')) return;
    try {
      await api.delete(`/teams/${id}`);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <ContentCrudModule
        title="Team Directory"
        subtitle="Organize chapter teams. Leads & Co-Leads reference the single Member collection without data duplication."
        items={teams}
        loading={loading}
        onAdd={handleOpenAdd}
        columns={['Team Name', 'Description', 'Assigned Lead', 'Status']}
        renderRow={(t) => (
          <tr key={t._id} className="hover:bg-[#0d1117]/60 transition-colors">
            <td className="px-6 py-4 font-bold text-white text-sm">{t.name}</td>
            <td className="px-6 py-4 text-xs text-gray-400 max-w-xs truncate">{t.description}</td>
            <td className="px-6 py-4 text-xs text-gray-200">{t.leadRef?.name || 'Unassigned'}</td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                t.status === 'Active' ? 'bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30' : 'bg-gray-800 text-gray-400'
              }`}>
                {t.status}
              </span>
            </td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleOpenEdit(t)} className="p-2 rounded-lg bg-[#21262d] text-gray-300 hover:text-white">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(t._id)} className="p-2 rounded-lg bg-[#21262d] text-red-400 hover:bg-red-500/20">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        )}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
              <h3 className="text-lg font-bold text-white">{formData._id ? 'Edit Team' : 'Create Team'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                  <label className="block text-gray-300 font-semibold mb-1">Select Team Lead (Member Ref)</label>
                  <select
                    value={formData.leadRef}
                    onChange={e => setFormData({ ...formData, leadRef: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  >
                    <option value="">-- Unassigned --</option>
                    {members.map(m => (
                      <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Select Co-Lead (Member Ref)</label>
                  <select
                    value={formData.coLeadRef}
                    onChange={e => setFormData({ ...formData, coLeadRef: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  >
                    <option value="">Select Member...</option>
                    {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.role})</option>)}
                  </select>
                </div>
              </div>

              <button
                  type="submit"
                  className="w-full py-3 rounded-xl gradient-button font-bold text-sm"
                >
                  Save Team
                </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
