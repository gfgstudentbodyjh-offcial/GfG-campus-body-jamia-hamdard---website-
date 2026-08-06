import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { X, Eye, EyeOff, Lock, ShieldCheck, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { changePassword, logout, openAuthModal } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Your new password must be different from your current password.');
      return;
    }

    setSubmitting(true);
    const res = await changePassword(currentPassword, newPassword, confirmPassword);

    if (res.success) {
      onClose();
      // Log out old session for security and prompt sign in
      logout();
      openAuthModal('login');
      alert('✓ Password updated successfully. Please sign in again with your new password.');
    } else {
      setError(res.message);
    }
    setSubmitting(false);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md overflow-y-auto p-4 flex min-h-full items-center justify-center font-sans">
      <div className="relative w-full max-w-md my-auto bg-[#121721] border border-[#30363d] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl text-white z-[10000]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2f9e44]/15 text-[#2f9e44] border border-[#2f9e44]/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Change Password</h3>
              <p className="text-[11px] text-gray-400">Update your account security credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#1e2530] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Current Password */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Current Password *</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-3.5 pr-10 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">New Password *</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-3.5 pr-10 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Confirm New Password *</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-3.5 pr-10 py-2.5 text-white text-xs font-medium focus:outline-none focus:border-[#2f9e44]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 font-mono">
            Password requirements: Minimum 8 characters. Must be different from your current password.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#18202c] text-xs font-bold text-gray-300 hover:text-white hover:bg-[#21262d] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl gradient-button text-xs font-bold shadow-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Password'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
