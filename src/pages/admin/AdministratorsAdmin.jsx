import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  ShieldAlert, 
  Copy, 
  Check, 
  AlertTriangle, 
  Lock, 
  UserX, 
  RefreshCw, 
  Eye, 
  Shield, 
  CheckCircle2, 
  X,
  History
} from 'lucide-react';

export default function AdministratorsAdmin() {
  const { isLight } = useAdminTheme();
  const { adminAccess: currentAdminAccess } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('admins'); // 'admins' | 'logs'
  const [searchTerm, setSearchTerm] = useState('');

  // Grant Admin Modal
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [grantRole, setGrantRole] = useState('ADMIN');
  const [selectedPermissions, setSelectedPermissions] = useState(['manage_members', 'manage_events']);
  const [customPin, setCustomPin] = useState('');
  const [submittingGrant, setSubmittingGrant] = useState(false);
  const [grantError, setGrantError] = useState('');

  // Generated PIN Display Modal (SHOWN ONLY ONCE!)
  const [onceModalOpen, setOnceModalOpen] = useState(false);
  const [oncePin, setOncePin] = useState('');
  const [onceTitle, setOnceTitle] = useState('');
  const [copied, setCopied] = useState(false);

  // Self-Service PIN Change Modal
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [selfPinForm, setSelfPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [selfPinMsg, setSelfPinMsg] = useState({ type: '', text: '' });

  const allPermissions = [
    { id: 'manage_members', label: 'Manage Members & Directory' },
    { id: 'manage_events', label: 'Manage Events & Workshops' },
    { id: 'manage_gallery', label: 'Manage Photo & Video Gallery' },
    { id: 'manage_resources', label: 'Manage Resources & Documents' },
    { id: 'manage_admins', label: 'Manage Administrators & Security' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, membersRes, logsRes] = await Promise.all([
        api.get('/admin/administrators').catch(() => ({ data: { data: [] } })),
        api.get('/members').catch(() => ({ data: { data: [] } })),
        api.get('/admin/audit-logs').catch(() => ({ data: { data: [] } }))
      ]);

      setAdmins(adminsRes.data.data || []);
      setMembersList(membersRes.data.data || []);
      setAuditLogs(logsRes.data.data || []);
    } catch (err) {
      console.warn('Failed loading administrators data:', err);
    }
    setLoading(false);
  };

  // Toggle permission checkbox
  const togglePermission = (permId) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  // Submit Grant Admin Access
  const handleGrantAdmin = async (e) => {
    e.preventDefault();
    setSubmittingGrant(true);
    setGrantError('');

    try {
      const res = await api.post('/admin/administrators', {
        email: selectedUserEmail,
        adminRole: grantRole,
        permissions: selectedPermissions,
        customPin: customPin.trim() || undefined
      });

      if (res.data.success) {
        setIsGrantModalOpen(false);
        setOnceTitle(`Administrative Access Granted to ${selectedUserEmail}`);
        setOncePin(res.data.generatedPin);
        setOnceModalOpen(true);
        setSelectedUserEmail('');
        setCustomPin('');
        loadData();
      }
    } catch (err) {
      setGrantError(err.response?.data?.message || 'Failed to grant administrative access.');
    }
    setSubmittingGrant(false);
  };

  // Reset Admin PIN
  const handleResetPin = async (adminObj) => {
    const confirm = window.confirm(`Reset Admin PIN for ${adminObj.userRef?.username || adminObj.userRef?.email}?`);
    if (!confirm) return;

    try {
      const res = await api.post(`/admin/administrators/${adminObj._id}/reset-pin`);
      if (res.data.success) {
        setOnceTitle(`New Admin PIN for ${adminObj.userRef?.username}`);
        setOncePin(res.data.generatedPin);
        setOnceModalOpen(true);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset PIN.');
    }
  };

  // Suspend / Unsuspend Admin
  const handleToggleSuspend = async (adminObj) => {
    const newStatus = adminObj.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await api.patch(`/admin/administrators/${adminObj._id}`, { status: newStatus });
      if (res.data.success) {
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update admin status.');
    }
  };

  // Revoke Admin Access
  const handleRevoke = async (adminObj) => {
    const confirm = window.confirm(`Revoke administrative access permanently for ${adminObj.userRef?.username}?`);
    if (!confirm) return;

    try {
      const res = await api.delete(`/admin/administrators/${adminObj._id}`);
      if (res.data.success) {
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke admin access.');
    }
  };

  // Copy Generated PIN to Clipboard
  const handleCopyPin = () => {
    navigator.clipboard.writeText(oncePin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Self Service PIN Change
  const handleSelfPinChange = async (e) => {
    e.preventDefault();
    setSelfPinMsg({ type: '', text: '' });

    if (selfPinForm.newPin !== selfPinForm.confirmPin) {
      setSelfPinMsg({ type: 'error', text: 'New PIN and Confirm PIN do not match.' });
      return;
    }

    try {
      const res = await api.patch('/auth/change-admin-pin', selfPinForm);
      if (res.data.success) {
        setSelfPinMsg({ type: 'success', text: '✓ Admin PIN updated successfully.' });
        setSelfPinForm({ currentPin: '', newPin: '', confirmPin: '' });
      }
    } catch (err) {
      setSelfPinMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change PIN.' });
    }
  };

  const filteredAdmins = admins.filter(a => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.userRef?.username?.toLowerCase().includes(term) ||
      a.userRef?.email?.toLowerCase().includes(term) ||
      a.adminRole?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 text-gray-100 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider bg-[#2f9e44]/15 border border-[#2f9e44]/30 px-2 py-0.5 rounded">
              SYSTEM SECURITY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Administrators & Security</h1>
          <p className="text-xs text-gray-400">Manage administrative access, individual 6-digit PINs, permissions, and security audit logs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsChangePinOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#18202c] border border-[#30363d] hover:border-[#2f9e44] text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-2 transition-all"
          >
            <KeyRound className="w-4 h-4 text-[#2f9e44]" />
            <span>Change My Admin PIN</span>
          </button>

          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="px-4 py-2 rounded-xl gradient-button text-xs font-bold text-white flex items-center gap-2 shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            <span>Grant Admin Access</span>
          </button>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center gap-2 border-b border-[#30363d]">
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2.5 text-xs font-mono font-bold transition-colors border-b-2 ${
            activeTab === 'admins'
              ? 'border-[#2f9e44] text-[#2f9e44]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Active Administrators ({admins.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-mono font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-[#2f9e44] text-[#2f9e44]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Security Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: ADMINISTRATORS TABLE */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <input
              type="text"
              placeholder="Search by name, email, role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-[#121721] border border-[#30363d] rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2f9e44] w-72"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 font-mono text-xs">Loading administrators data...</div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-mono text-xs">No administrators found.</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#30363d] bg-[#121721]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#30363d] text-[10px] font-mono text-gray-400 uppercase bg-[#0d1117]/60">
                    <th className="py-3 px-4">Administrator</th>
                    <th className="py-3 px-4">Community Role</th>
                    <th className="py-3 px-4">Admin Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]/60 text-xs">
                  {filteredAdmins.map((adm) => {
                    const isRoot = adm.adminRole === 'ROOT_SUPER_ADMIN';
                    const isSelf = currentAdminAccess?.userRef === adm.userRef?._id;

                    return (
                      <tr key={adm._id} className="hover:bg-[#18202c]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={adm.userRef?.avatar || 'https://ui-avatars.com/api/?name=Admin'}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-[#30363d]"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{adm.userRef?.username || 'User'}</span>
                                {isRoot && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                    ROOT
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono">{adm.userRef?.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#18202c] text-gray-300 border border-[#30363d]">
                            {adm.userRef?.memberRef?.role || adm.userRef?.role || 'Member'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                            isRoot 
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/40' 
                              : adm.adminRole === 'SUPER_ADMIN'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                              : 'bg-blue-500/15 text-blue-400 border-blue-500/40'
                          }`}>
                            {adm.adminRole}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold ${
                            adm.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              adm.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                            }`} />
                            {adm.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                          {adm.lastLoginAt ? new Date(adm.lastLoginAt).toLocaleString() : 'Never'}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {/* Reset PIN */}
                          <button
                            onClick={() => handleResetPin(adm)}
                            className="p-1.5 rounded-lg bg-[#18202c] hover:bg-[#30363d] text-gray-300 hover:text-white border border-[#30363d] transition-all inline-flex items-center gap-1 text-[11px]"
                            title="Reset 6-digit Admin PIN"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                            <span>Reset PIN</span>
                          </button>

                          {/* Suspend / Unsuspend */}
                          {!isRoot && (
                            <button
                              onClick={() => handleToggleSuspend(adm)}
                              className={`p-1.5 rounded-lg text-[11px] font-semibold border transition-all inline-flex items-center gap-1 ${
                                adm.status === 'Active'
                                  ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border-rose-500/30'
                                  : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30'
                              }`}
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>{adm.status === 'Active' ? 'Suspend' : 'Unsuspend'}</span>
                            </button>
                          )}

                          {/* Revoke Access */}
                          {!isRoot && (
                            <button
                              onClick={() => handleRevoke(adm)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all inline-flex items-center"
                              title="Revoke Access"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="overflow-x-auto rounded-2xl border border-[#30363d] bg-[#121721]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#30363d] text-[10px] font-mono text-gray-400 uppercase bg-[#0d1117]/60">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target User</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log._id} className="hover:bg-[#18202c]/50">
                  <td className="py-3 px-4 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-200">{log.operatorEmail || 'System'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      log.action.includes('SUCCESS') ? 'bg-emerald-500/20 text-emerald-400' :
                      log.action.includes('FAILED') ? 'bg-rose-500/20 text-rose-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{log.targetEmail || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-400 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: GRANT ADMIN ACCESS */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121721] border border-[#30363d] rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-2 text-white font-bold">
                <UserPlus className="w-5 h-5 text-[#2f9e44]" />
                <span>Grant Administrative Access</span>
              </div>
              <button onClick={() => setIsGrantModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {grantError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {grantError}
              </div>
            )}

            <form onSubmit={handleGrantAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">User Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Select or enter user email..."
                  value={selectedUserEmail}
                  onChange={e => setSelectedUserEmail(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Administrative Role</label>
                <select
                  value={grantRole}
                  onChange={e => setGrantRole(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                >
                  <option value="ADMIN">ADMIN (Module Limited)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full CMS Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Module Permissions</label>
                <div className="space-y-2">
                  {allPermissions.map(p => (
                    <label key={p.id} className="flex items-center gap-2.5 cursor-pointer text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(p.id)}
                        onChange={() => togglePermission(p.id)}
                        className="rounded border-[#30363d] bg-[#0d1117] text-[#2f9e44] focus:ring-0"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-300 font-semibold">Admin PIN (Optional)</label>
                  <span className="text-[10px] text-gray-500">Leave blank to auto-generate 6 digits</span>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Auto-generated if empty"
                  value={customPin}
                  onChange={e => setCustomPin(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#18202c] text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGrant}
                  className="px-5 py-2.5 rounded-xl gradient-button text-xs font-bold text-white shadow-lg"
                >
                  {submittingGrant ? 'Granting...' : 'Grant Admin Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERATED PIN DISPLAY MODAL (SHOWN ONCE ONLY) */}
      {onceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121721] border-2 border-[#2f9e44] rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2f9e44]/20 border border-[#2f9e44]/40 text-[#2f9e44]">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{onceTitle}</h3>
              <p className="text-xs text-gray-400 mt-1">Individual Administrative Security Credentials</p>
            </div>

            {/* Huge PIN Display */}
            <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
              <span className="text-3xl font-mono font-black text-[#2f9e44] tracking-widest pl-2">
                {oncePin}
              </span>
              <button
                onClick={handleCopyPin}
                className="px-3 py-1.5 rounded-xl bg-[#18202c] hover:bg-[#30363d] border border-[#30363d] text-xs font-semibold text-white flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-gray-300" />}
                <span>{copied ? 'Copied!' : 'Copy PIN'}</span>
              </button>
            </div>

            {/* Warning Box */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left flex items-start gap-2.5 text-xs text-amber-300">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Save/Share this PIN securely!</span>
                <span className="text-[11px] text-amber-300/80">It is encrypted with bcrypt in the database and will NOT be displayed again.</span>
              </div>
            </div>

            <button
              onClick={() => setOnceModalOpen(false)}
              className="w-full py-3 rounded-xl gradient-button text-xs font-bold text-white shadow-lg"
            >
              Done (I Have Saved This PIN)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: SELF-SERVICE CHANGE PIN */}
      {isChangePinOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121721] border border-[#30363d] rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
              <div className="flex items-center gap-2 text-white font-bold">
                <KeyRound className="w-5 h-5 text-[#2f9e44]" />
                <span>Change My Admin PIN</span>
              </div>
              <button onClick={() => setIsChangePinOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selfPinMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-medium ${
                selfPinMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}>
                {selfPinMsg.text}
              </div>
            )}

            <form onSubmit={handleSelfPinChange} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Current Admin PIN</label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  placeholder="• • • • • •"
                  value={selfPinForm.currentPin}
                  onChange={e => setSelfPinForm({ ...selfPinForm, currentPin: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">New Admin PIN (6 Digits)</label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  placeholder="• • • • • •"
                  value={selfPinForm.newPin}
                  onChange={e => setSelfPinForm({ ...selfPinForm, newPin: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Confirm New Admin PIN</label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  placeholder="• • • • • •"
                  value={selfPinForm.confirmPin}
                  onChange={e => setSelfPinForm({ ...selfPinForm, confirmPin: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePinOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#18202c] text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl gradient-button text-xs font-bold text-white shadow-lg"
                >
                  Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
