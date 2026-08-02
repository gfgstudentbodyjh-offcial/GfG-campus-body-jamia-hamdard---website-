import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Code2, Shield, KeyRound, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@gfgcampus.org');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2f9e44]/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1b5e20] to-[#2f9e44] p-0.5 shadow-xl shadow-green-900/30">
          <div className="w-full h-full bg-[#0d1117] rounded-[14px] flex items-center justify-center">
            <Code2 className="w-7 h-7 text-[#2f9e44]" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Super Admin Portal</h2>
        <p className="text-xs text-gray-400">Community Management Platform (Community OS)</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl border border-[#30363d] space-y-6 shadow-2xl">
          
          <div className="p-3.5 rounded-xl bg-[#2f9e44]/10 border border-[#2f9e44]/30 text-xs text-gray-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#2f9e44]">
              <Sparkles className="w-4 h-4" /> Demo Super Admin Credentials
            </div>
            <p className="text-[11px] text-gray-400">Email: <span className="text-white font-mono">admin@gfgcampus.org</span></p>
            <p className="text-[11px] text-gray-400">Password: <span className="text-white font-mono">admin123</span></p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Super Admin Email</label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-button font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-green-900/30 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Super Admin SaaS'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-gray-400 hover:text-white font-medium transition-colors">
              ← Back to Public Website
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
