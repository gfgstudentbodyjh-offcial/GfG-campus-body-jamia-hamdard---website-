import React, { useState } from 'react';
import { Flag, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import TechCard from './TechCard';
import api from '../../services/api';

const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Hate or abusive content',
  'Misleading information',
  'Inappropriate content',
  'Scam / suspicious link',
  'Privacy concern',
  'Other'
];

export default function ReportModal({ targetType, targetId, onClose, onSuccess }) {
  const [selectedReason, setSelectedReason] = useState('Spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentMemberId = localStorage.getItem('gfg_member_id') || 'm_saquib';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await api.post('/reports', {
        reporterId: currentMemberId,
        targetType,
        targetId,
        reason: selectedReason,
        details: selectedReason === 'Other' ? details : details
      });

      if (res.data.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess(res.data.message);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Couldn’t submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <TechCard className="w-full max-w-md p-6 bg-[#121721] border-red-500/40 rounded-t-2xl sm:rounded-2xl space-y-5 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Report {targetType === 'post' ? 'Post' : 'Comment'}</h3>
              <p className="text-[10px] text-gray-400 font-mono">Help keep the GFG Community safe & constructive</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#18202c]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-3">
            <div className="p-3 rounded-full bg-[#2f9e44]/15 text-[#2f9e44] w-fit mx-auto border border-[#2f9e44]/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-white text-base">✓ Report Submitted</h4>
            <p className="text-xs text-gray-300">Thanks for helping keep the GFG Community safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-gray-300">Why are you reporting this?</label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      selectedReason === r
                        ? 'bg-[#18202c] border-[#2f9e44] text-white shadow-md'
                        : 'bg-[#0a0d12] border-[#30363d] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span>{r}</span>
                    <input
                      type="radio"
                      name="reportReason"
                      value={r}
                      checked={selectedReason === r}
                      onChange={() => setSelectedReason(r)}
                      className="accent-[#2f9e44]"
                    />
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === 'Other' && (
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-gray-300">Additional details</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="Describe the issue specifically..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-[#0a0d12] border border-[#30363d] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#18202c] text-gray-300 hover:text-white text-xs font-bold border border-[#30363d]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl gradient-button text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>

          </form>
        )}

      </TechCard>
    </div>
  );
}
