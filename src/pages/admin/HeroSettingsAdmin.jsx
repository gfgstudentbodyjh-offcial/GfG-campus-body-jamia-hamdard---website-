import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MediaPicker from '../../components/admin/MediaPicker';
import { Sliders, Save, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function HeroSettingsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    siteTitle: 'GeeksforGeeks Student Chapter | Jamia Hamdard',
    metaDescription: 'Official GeeksforGeeks Student Chapter Community Management Platform',
    heroHeading: 'Empowering Innovators, Coders & Future Tech Leaders',
    heroSubheading: 'Master Data Structures, Full-Stack Web Dev, Artificial Intelligence & Competitive Programming with Jamia Hamdard’s official GFG Campus Body.',
    ctaText: 'Explore Upcoming Events',
    ctaLink: '#events',
    heroBgUrl: '',
    contactEmail: 'gfg.chapter@jamiahamdard.ac.in'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.data) {
        setFormData(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.warn(err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', formData);
      alert('Site & Hero settings updated successfully!');
    } catch (err) {
      alert('Update failed');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl space-y-8">
      
      <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl">
        <h1 className="text-2xl font-extrabold text-white">Hero Section & Site Branding Copy</h1>
        <p className="text-sm text-gray-400 mt-1">
          Keep hero layout clean & fixed while easily updating headlines, subheadings, CTA buttons, and SEO titles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-[#30363d] space-y-6 text-xs">
        
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2f9e44]" /> Main Hero Presentation
          </h3>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Hero Headline</label>
            <input
              type="text"
              required
              value={formData.heroHeading}
              onChange={e => setFormData({ ...formData, heroHeading: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Hero Subheading Copy</label>
            <textarea
              rows={3}
              required
              value={formData.heroSubheading}
              onChange={e => setFormData({ ...formData, heroSubheading: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Primary CTA Button Text</label>
              <input
                type="text"
                required
                value={formData.ctaText}
                onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Primary CTA Button Target Link</label>
              <input
                type="text"
                required
                value={formData.ctaLink}
                onChange={e => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-[#30363d]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Site SEO & Contact Copy</h3>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Public Site Title (Browser Tab)</label>
            <input
              type="text"
              required
              value={formData.siteTitle}
              onChange={e => setFormData({ ...formData, siteTitle: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Chapter Contact Email</label>
            <input
              type="email"
              required
              value={formData.contactEmail}
              onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-xl gradient-button font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-green-900/30"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving Changes...' : 'Save & Publish Hero Copy'}
        </button>

      </form>

    </div>
  );
}
