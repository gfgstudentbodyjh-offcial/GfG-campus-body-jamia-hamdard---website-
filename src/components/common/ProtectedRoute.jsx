import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, adminAccess, isAuthenticated, isAdminAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#2f9e44] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-mono">Verifying Administrative session...</p>
        </div>
      </div>
    );
  }

  // Must be authenticated and have active AdminAccess
  if (!isAuthenticated || (!isAdminAuthenticated && !adminAccess)) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#161b22] border border-red-500/40 space-y-4 shadow-2xl">
          <div className="p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 w-fit mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrative Access Required</h2>
          <p className="text-xs text-gray-300 leading-relaxed">
            You are logged into a community account, but do not possess active System Administrative authority (<code className="text-amber-400">AdminAccess</code>).
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/admin/login"
              className="px-5 py-2.5 rounded-xl gradient-button text-xs font-bold inline-flex items-center justify-center gap-2 shadow-lg"
            >
              Sign In to Super Admin Portal
            </Link>
            <Link
              to="/"
              className="text-xs text-gray-400 hover:text-white transition-colors pt-1"
            >
              ← Return to GFG Campus Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
