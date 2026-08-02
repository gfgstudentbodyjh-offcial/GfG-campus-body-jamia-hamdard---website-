import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FormViewerPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadForm = async () => {
      try {
        const res = await api.get(`/forms/${formId}`);
        setForm(res.data.data);
      } catch (err) {
        setErrorMsg('Form not found or no longer active.');
      }
      setLoading(false);
    };
    loadForm();
  }, [formId]);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.post(`/forms/${formId}/submit`, { answers: formData });
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit form responses.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading Registration Form...</div>
        ) : submitted ? (
          <div className="glass-panel p-12 rounded-3xl border border-[#2f9e44] text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-[#2f9e44] mx-auto" />
            <h2 className="text-2xl font-bold text-white">Submission Confirmed!</h2>
            <p className="text-sm text-gray-300">Your form response has been securely recorded. Our team will get in touch with you shortly.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2.5 rounded-xl gradient-button text-xs font-bold"
            >
              Return to Homepage
            </button>
          </div>
        ) : !form ? (
          <div className="glass-panel p-12 rounded-3xl border border-red-500/40 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Unable to Load Form</h2>
            <p className="text-sm text-gray-400">{errorMsg || 'Form is unavailable'}</p>
          </div>
        ) : (
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-[#30363d] space-y-8">
            <div className="space-y-2 pb-6 border-b border-[#30363d]">
              <span className="text-xs font-bold text-[#2f9e44] uppercase tracking-wider">Dynamic Registration Form</span>
              <h1 className="text-3xl font-extrabold text-white">{form.title}</h1>
              {form.description && <p className="text-sm text-gray-400">{form.description}</p>}
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields?.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-300">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
                    >
                      <option value="">Select option...</option>
                      {field.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={e => handleChange(field.id, e.target.value)}
                      rows={4}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl gradient-button font-bold text-sm shadow-xl shadow-green-900/30 disabled:opacity-50"
              >
                {submitting ? 'Submitting Responses...' : 'Submit Form Response'}
              </button>
            </form>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
