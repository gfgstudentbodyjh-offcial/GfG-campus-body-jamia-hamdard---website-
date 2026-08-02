import React, { useState, useEffect } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import api from '../../services/api';
import { Edit3, Trash2, X } from 'lucide-react';

export default function FacultyAdmin() {
  const [coordinators, setCoordinators] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    memberRef: '',
    designation: '',
    department: '',
    displayOrder: 1,
    status: 'Active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [facRes, memRes] = await Promise.all([
        api.get('/faculty'),
        api.get('/members')
      ]);
      setCoordinators(facRes.data.data || []);
      setMembers(memRes.data.data || []);
    } catch (err) {
      console.warn(err);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setFormData({
      _id: '',
      memberRef: members[0]?._id || '',
      designation: 'Faculty Advisor',
      department: 'Dept. of CSE',
      displayOrder: coordinators.length + 1,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f) => {
    setFormData({
      _id: f._id,
      memberRef: f.memberRef?._id || f.memberRef || '',
      designation: f.designation || '',
      department: f.department || '',
      displayOrder: f.displayOrder || 1,
      status: f.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/faculty/${formData._id}`, formData);
      } else {
        await api.post('/faculty', formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Save faculty record failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete record?')) return;
    try {
      await api.delete(`/faculty/${id}`);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <ContentCrudModule
        title="Faculty Coordinators"
        subtitle="Manage faculty advisory body. References single source Member profile data."
        items={coordinators}
        loading={loading}
        onAdd={handleOpenAdd}
        columns={['Advisor Profile', 'Designation', 'Department', 'Status']}
        renderRow={(f) => (
          <tr key={f._id} className="hover:bg-[#0d1117]/60 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={f.memberRef?.photo || f.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                  alt={f.memberRef?.name || f.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#2f9e44] bg-[#21262d]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <span className="font-bold text-white text-sm">{f.memberRef?.name || f.name || 'Faculty Member'}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-xs text-gray-300">{f.designation}</td>
            <td className="px-6 py-4 text-xs text-gray-400">{f.department}</td>
            <td className="px-6 py-4">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30">
                {f.status}
              </span>
            </td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleOpenEdit(f)} className="p-2 rounded-lg bg-[#21262d] text-gray-300 hover:text-white">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(f._id)} className="p-2 rounded-lg bg-[#21262d] text-red-400 hover:bg-red-500/20">
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
              <h3 className="text-lg font-bold text-white">{formData._id ? 'Edit Faculty Record' : 'Add Faculty Advisor'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Select Faculty Profile (Member Ref)</label>
                <select
                  value={formData.memberRef}
                  onChange={e => setFormData({ ...formData, memberRef: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                >
                  <option value="">Select Member...</option>
                  {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.email})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Academic Designation</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-sm">
                Save Faculty Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
