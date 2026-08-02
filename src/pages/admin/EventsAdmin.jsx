import React, { useState, useEffect } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import MediaPicker from '../../components/admin/MediaPicker';
import api from '../../services/api';
import { Edit3, Trash2, Image as ImageIcon, X } from 'lucide-react';

export default function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const statuses = ['All', 'Draft', 'Published', 'Registration Open', 'Live', 'Completed', 'Archived'];

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    venue: '',
    banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    registrationLink: '',
    formId: '',
    status: 'Registration Open'
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [evRes, formRes] = await Promise.all([
        api.get('/events', { params: { status: statusFilter } }),
        api.get('/forms')
      ]);
      setEvents(evRes.data.data || []);
      setForms(formRes.data.data || []);
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
      date: new Date().toISOString().split('T')[0],
      venue: '',
      banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      registrationLink: '',
      formId: forms[0]?._id || '',
      status: 'Registration Open'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev) => {
    setFormData({
      _id: ev._id,
      title: ev.title || '',
      description: ev.description || '',
      date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '',
      venue: ev.venue || '',
      banner: ev.banner || '',
      registrationLink: ev.registrationLink || '',
      formId: ev.formId?._id || ev.formId || '',
      status: ev.status || 'Registration Open'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await api.put(`/events/${formData._id}`, formData);
      } else {
        await api.post('/events', formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete event?')) return;
    try {
      await api.delete(`/events/${id}`);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <ContentCrudModule
        title="Events & Lifecycle Manager"
        subtitle="Manage event statuses: [Draft → Published → Registration Open → Live → Completed → Archived]."
        items={events}
        loading={loading}
        onAdd={handleOpenAdd}
        filterOptions={statuses}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        columns={['Event Banner & Title', 'Schedule Date', 'Venue Location', 'Lifecycle Status']}
        renderRow={(ev) => (
          <tr key={ev._id} className="hover:bg-[#0d1117]/60 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img src={ev.banner} alt={ev.title} className="w-14 h-10 rounded-lg object-cover border border-[#30363d]" />
                <div>
                  <p className="font-bold text-white text-sm">{ev.title}</p>
                  <p className="text-[10px] text-gray-400 max-w-xs truncate">{ev.description}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 text-xs text-gray-300">
              {new Date(ev.date).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 text-xs text-gray-400">{ev.venue}</td>
            <td className="px-6 py-4">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                ev.status === 'Registration Open' || ev.status === 'Live'
                  ? 'bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {ev.status}
              </span>
            </td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleOpenEdit(ev)} className="p-2 rounded-lg bg-[#21262d] text-gray-300 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(ev._id)} className="p-2 rounded-lg bg-[#21262d] text-red-400 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
            </td>
          </tr>
        )}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
              <h3 className="text-lg font-bold text-white">{formData._id ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Banner Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.banner}
                    onChange={e => setFormData({ ...formData, banner: e.target.value })}
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
                <label className="block text-gray-300 font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Event Description</label>
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
                  <label className="block text-gray-300 font-semibold mb-1">Schedule Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Venue Location</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Link Dynamic Form</label>
                  <select
                    value={formData.formId}
                    onChange={e => setFormData({ ...formData, formId: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  >
                    <option value="">None (Use Link Below)</option>
                    {forms.map(f => <option key={f._id} value={f._id}>{f.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Lifecycle Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  >
                    {statuses.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-sm">
                Save Event Details
              </button>
            </form>
          </div>
        </div>
      )}

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={(url) => setFormData(prev => ({ ...prev, banner: url }))}
        currentFolder="Events"
      />

    </div>
  );
}
