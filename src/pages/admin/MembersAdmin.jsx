import React, { useState, useEffect } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import MediaPicker from '../../components/admin/MediaPicker';
import api from '../../services/api';
import { Upload, Download, Trash2, Edit3, Image as ImageIcon, Plus, X } from 'lucide-react';

export default function MembersAdmin() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
    teamName: 'Technical Team',
    role: 'Core Member',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    github: '',
    linkedin: '',
    skills: 'React, Node.js',
    status: 'Active'
  });

  const teamsList = ['All', 'Technical Team', 'Design & Media', 'Event Management', 'Faculty Advisory', 'Executive Team'];

  useEffect(() => {
    loadMembers();
  }, [search, teamFilter]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/members', { params: { search, team: teamFilter } });
      setMembers(res.data.data || []);
    } catch (err) {
      console.warn(err);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setFormData({
      _id: '',
      name: '',
      email: '',
      phone: '',
      teamName: 'Technical Team',
      role: 'Core Member',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      github: '',
      linkedin: '',
      skills: 'React, Node.js',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setFormData({
      _id: m._id,
      name: m.name || '',
      email: m.email || '',
      phone: m.phone || '',
      teamName: m.teamName || 'Technical Team',
      role: m.role || 'Core Member',
      photo: m.photo || '',
      github: m.github || '',
      linkedin: m.linkedin || '',
      skills: Array.isArray(m.skills) ? m.skills.join(', ') : m.skills || '',
      status: m.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (formData._id) {
        await api.put(`/members/${formData._id}`, payload);
      } else {
        await api.post('/members', payload);
      }
      setIsModalOpen(false);
      loadMembers();
    } catch (err) {
      alert('Failed saving member: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete member permanently?')) return;
    try {
      await api.delete(`/members/${id}`);
      loadMembers();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Email,Team,Role,Status"].join(",") + "\n"
      + members.map(e => `"${e.name}","${e.email}","${e.teamName}","${e.role}","${e.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gfg_members_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleImportCSVSubmit = async () => {
    try {
      const parsed = JSON.parse(importJsonText);
      await api.post('/members/import', { membersList: parsed });
      alert('Members imported successfully!');
      setIsImportModalOpen(false);
      loadMembers();
    } catch (err) {
      alert('Invalid JSON array or import failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* CSV Import/Export Bar */}
      <div className="flex justify-end gap-3">
        <button onClick={() => setIsImportModalOpen(true)} className="px-4 py-2 rounded-xl bg-[#21262d] text-gray-300 hover:text-white border border-[#30363d] text-xs font-semibold flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#2f9e44]" /> CSV / JSON Import
        </button>
        <button onClick={handleExportCSV} className="px-4 py-2 rounded-xl bg-[#21262d] text-gray-300 hover:text-white border border-[#30363d] text-xs font-semibold flex items-center gap-2">
          <Download className="w-4 h-4 text-[#2f9e44]" /> Export Directory CSV
        </button>
      </div>

      <ContentCrudModule
        title="Member Directory"
        subtitle="Single Source of Truth collection for all community leads, faculty & general members."
        items={members}
        loading={loading}
        onAdd={handleOpenAdd}
        filterOptions={teamsList}
        activeFilter={teamFilter}
        onFilterChange={setTeamFilter}
        searchTerm={search}
        onSearchChange={setSearch}
        columns={['Member Profile', 'Email & Contact', 'Team / Role', 'Status']}
        renderRow={(m) => (
          <tr key={m._id} className="hover:bg-[#0d1117]/60 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={m.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                  alt={m.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#2f9e44] bg-[#21262d]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div>
                  <p className="font-bold text-white text-sm">{m.name}</p>
                  <p className="text-[10px] text-[#2f9e44] font-medium">{Array.isArray(m.skills) ? m.skills.slice(0, 3).join(', ') : ''}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 text-xs text-gray-300">{m.email}</td>
            <td className="px-6 py-4">
              <div>
                <p className="text-xs font-bold text-white">{m.teamName}</p>
                <p className="text-[10px] text-gray-400">{m.role}</p>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                m.status === 'Active' ? 'bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30' : 'bg-gray-800 text-gray-400'
              }`}>
                {m.status}
              </span>
            </td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleOpenEdit(m)} className="p-2 rounded-lg bg-[#21262d] text-gray-300 hover:text-white">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(m._id)} className="p-2 rounded-lg bg-[#21262d] text-red-400 hover:bg-red-500/20">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        )}
      />

      {/* Member Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
              <h3 className="text-lg font-bold text-white">{formData._id ? 'Edit Member Profile' : 'Add New Member'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Photo URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.photo}
                    onChange={e => setFormData({ ...formData, photo: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Team</label>
                  <select
                    value={formData.teamName}
                    onChange={e => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  >
                    {teamsList.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Role Title</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, Node.js, C++, Python"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-sm">
                Save Member Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Import Members Batch (JSON Array)</h3>
            <textarea
              rows={8}
              placeholder='[ { "name": "John", "email": "john@gfg.org", "teamName": "Technical Team", "role": "Developer" } ]'
              value={importJsonText}
              onChange={e => setImportJsonText(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3 text-xs text-white font-mono"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-gray-400">Cancel</button>
              <button onClick={handleImportCSVSubmit} className="px-5 py-2 text-xs font-bold rounded-lg gradient-button">Import Batch</button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Media Picker */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={(url) => setFormData(prev => ({ ...prev, photo: url }))}
        currentFolder="Members"
      />

    </div>
  );
}
