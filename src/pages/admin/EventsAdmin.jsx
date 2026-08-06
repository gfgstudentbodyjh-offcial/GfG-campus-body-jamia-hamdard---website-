import React, { useState, useEffect, useRef } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import api from '../../services/api';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { formatEventDate } from '../../utils/dateUtils';
import { Edit3, Trash2, Camera, CheckCircle2, Calendar, Link as LinkIcon, Plus, X } from 'lucide-react';

export default function EventsAdmin() {
  const { isLight } = useAdminTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bannerInputRef = useRef(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const statuses = ['All', 'Upcoming', 'Registration Open', 'Announced', 'Planning', 'Live', 'Completed', 'Draft', 'Archived'];

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    venue: '',
    banner: '',
    registrationLink: '',
    status: 'Registration Open'
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events', { params: { status: statusFilter } });
      setEvents(res.data.data || []);
    } catch (err) {
      console.warn(err);
    }
    setLoading(false);
  };

  const filteredEvents = events.filter(ev => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (ev.title && ev.title.toLowerCase().includes(term)) ||
      (ev.description && ev.description.toLowerCase().includes(term)) ||
      (ev.venue && ev.venue.toLowerCase().includes(term))
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      _id: '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      venue: 'Jamia Hamdard Campus',
      banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      registrationLink: '',
      status: 'Registration Open'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev) => {
    let rawDate = '';
    if (ev.date) {
      const parsed = new Date(ev.date);
      if (!isNaN(parsed.getTime())) {
        rawDate = parsed.toISOString().split('T')[0];
      }
    }
    setFormData({
      _id: ev._id,
      title: ev.title || '',
      description: ev.description || '',
      date: rawDate || new Date().toISOString().split('T')[0],
      venue: ev.venue || '',
      banner: ev.banner || '',
      registrationLink: ev.registrationLink || '',
      status: ev.status || 'Registration Open'
    });
    setIsModalOpen(true);
  };

  const handleBannerSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, banner: localUrl }));
    setIsUploadingBanner(true);

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('type', 'image');

      const res = await api.post('/media/upload', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.url) {
        setFormData(prev => ({ ...prev, banner: res.data.url }));
      }
    } catch (err) {
      console.warn('Background banner upload finished:', err);
    } finally {
      setIsUploadingBanner(false);
    }
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
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleMarkCompleted = async (id) => {
    if (!window.confirm('Mark this event as completed? It will move to past events.')) return;
    try {
      await api.patch(`/events/${id}/complete`);
      loadData();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete event permanently?')) return;
    try {
      await api.delete(`/events/${id}`);
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const renderStatusBadge = (status) => {
    const st = status || 'Upcoming';
    if (isLight) {
      if (st === 'Completed') return 'bg-slate-100 text-slate-700 border-slate-200';
      if (st === 'Draft') return 'bg-amber-50 text-amber-700 border-amber-200';
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else {
      if (st === 'Completed') return 'bg-gray-800 text-gray-400 border-gray-700';
      if (st === 'Draft') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      return 'bg-[#2f9e44]/20 text-[#2f9e44] border-[#2f9e44]/40';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={bannerInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleBannerSelect}
      />

      <ContentCrudModule
        title="Events & Lifecycle Manager"
        subtitle="Create, edit, and mark events as Completed. Upload thumbnails directly from your device."
        items={filteredEvents}
        loading={loading}
        onAdd={handleOpenAdd}
        filterOptions={statuses}
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        columns={['Thumbnail & Event Title', 'Schedule Date', 'Venue', 'Status', 'Actions']}
        renderRow={(ev) => (
          <tr key={ev._id} className={`transition-colors ${
            isLight ? 'hover:bg-slate-50/80 border-b border-gray-200' : 'hover:bg-[#0d1117]/60 border-b border-[#30363d]'
          }`}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={ev.banner || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80'}
                  alt={ev.title}
                  className="w-16 h-10 rounded-lg object-cover border flex-shrink-0 shadow-sm"
                />
                <div>
                  <p className={`font-bold text-xs sm:text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>{ev.title}</p>
                  <p className={`text-[10px] max-w-xs truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{ev.description}</p>
                </div>
              </div>
            </td>
            <td className={`px-6 py-4 text-xs font-mono font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              {formatEventDate(ev.date)}
            </td>
            <td className={`px-6 py-4 text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{ev.venue || 'Jamia Hamdard'}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${renderStatusBadge(ev.status)}`}>
                {ev.status || 'Upcoming'}
              </span>
            </td>
            <td className="px-6 py-4 text-right space-x-2">
              {ev.status !== 'Completed' && (
                <button
                  onClick={() => handleMarkCompleted(ev._id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-[#2f9e44]/20 hover:bg-[#2f9e44] text-[#2f9e44] hover:text-white border-[#2f9e44]/30'
                  }`}
                  title="Mark Event Completed"
                >
                  Mark Completed
                </button>
              )}
              <button
                onClick={() => handleOpenEdit(ev)}
                className={`p-2 rounded-lg border transition-colors ${
                  isLight
                    ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    : 'bg-[#21262d] text-gray-300 border-[#30363d] hover:text-white'
                }`}
                title="Edit Event"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(ev._id)}
                className={`p-2 rounded-lg border transition-colors ${
                  isLight
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-[#21262d] text-red-400 border-[#30363d] hover:bg-red-500/20'
                }`}
                title="Delete Event"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        )}
      />

      {/* Create / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`rounded-2xl border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl transition-colors ${
            isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#161b22] border-[#30363d] text-white'
          }`}>
            
            <div className={`flex justify-between items-center border-b pb-4 ${isLight ? 'border-gray-200' : 'border-[#30363d]'}`}>
              <h3 className={`text-lg font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {formData._id ? 'Edit Event Details' : 'Create New Event'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className={`${isLight ? 'text-gray-400 hover:text-gray-700' : 'text-gray-400 hover:text-white'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-medium">
              
              {/* Event Thumbnail Native Device Picker */}
              <div className="space-y-1.5">
                <label className={`block font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Event Thumbnail Banner</label>
                <div className={`relative h-36 w-full rounded-xl overflow-hidden border group ${
                  isLight ? 'border-gray-300 bg-gray-50' : 'border-[#30363d] bg-[#0d1117]'
                }`}>
                  {formData.banner ? (
                    <img src={formData.banner} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-mono text-xs">
                      No Thumbnail Selected
                    </div>
                  )}

                  {isUploadingBanner && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-xs font-mono text-[#2f9e44] font-bold">
                      Uploading Thumbnail...
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2f9e44] text-white font-bold flex items-center gap-1.5 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" /> Upload Thumbnail
                    </button>
                    {formData.banner && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, banner: '' }))}
                        className="px-3.5 py-1.5 rounded-xl bg-red-500 text-white font-bold shadow"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Event Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AI & Machine Learning Workshop 2026"
                  className={`w-full rounded-xl px-3.5 py-2.5 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Description / Caption</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe event agenda, speakers, and topics..."
                  className={`w-full rounded-xl p-3 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Schedule Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                      isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Venue Location</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                      isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Google Form / External Registration Link</label>
                <input
                  type="text"
                  value={formData.registrationLink}
                  onChange={e => setFormData({ ...formData, registrationLink: e.target.value })}
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  className={`w-full rounded-xl px-3 py-2 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-[#0d1117] border-[#30363d] text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full rounded-xl px-3 py-2 border text-xs font-medium focus:outline-none focus:border-[#2f9e44] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0d1117] border-[#30363d] text-white'
                  }`}
                >
                  <option value="Registration Open">Registration Open</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Live">Live</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-xs shadow-lg">
                Save Event Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
