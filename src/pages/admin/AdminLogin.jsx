import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Code2, Shield, KeyRound, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await adminLogin(email, password, pin);
    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-gray-100">
      
      {/* Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2f9e44]/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1b5e20] to-[#2f9e44] p-0.5 shadow-xl shadow-green-900/30">
          <div className="w-full h-full bg-[#0d1117] rounded-[14px] flex items-center justify-center">
            <Code2 className="w-7 h-7 text-[#2f9e44]" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Super Admin Portal</h2>
        <p className="text-xs text-gray-400">Community Management Platform · Protected Administrative Access</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl border border-[#30363d] space-y-6 shadow-2xl bg-[#121721]">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Email Address */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Super Admin Email</label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@domain.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#2f9e44]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Admin PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-gray-300 font-semibold">Admin PIN</label>
                <span className="text-[10px] text-gray-500 font-mono">6-Digit Security PIN</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  maxLength={8}
                  placeholder="• • • • • •"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-10 pr-10 py-3 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-[#2f9e44]"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-button font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-green-900/30 disabled:opacity-50"
            >
              {loading ? 'Verifying 3-Factor Auth...' : 'Sign In to Admin Portal'} <ArrowRight className="w-4 h-4" />
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
