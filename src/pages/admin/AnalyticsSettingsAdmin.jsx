import React from 'react';
import { BarChart3, Key, ShieldCheck, Database, Server, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AnalyticsSettingsAdmin() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl space-y-8">
      
      <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-2xl">
        <h1 className="text-2xl font-extrabold text-white">System Analytics & Tenant Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Multi-tenant community status, security credentials, and API engine info.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* System Health */}
        <div className="glass-panel p-6 rounded-2xl border border-[#30363d] space-y-4">
          <div className="flex items-center gap-3 border-b border-[#30363d] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#2f9e44]/20 border border-[#2f9e44] flex items-center justify-center text-[#2f9e44]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">API & Storage Status</h3>
              <p className="text-xs text-gray-400">Node.js Express + Mongoose + Cloudinary</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="flex items-center justify-between">
              <span>Database Engine:</span>
              <span className="font-semibold text-white">MongoDB (Mongoose)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Media Provider:</span>
              <span className="font-semibold text-white">Cloudinary / Local Uploads</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tenant Scope:</span>
              <span className="font-semibold text-[#2f9e44]">gfg-jamia-hamdard</span>
            </div>
            <div className="flex items-center justify-between">
              <span>JWT Authentication:</span>
              <span className="font-semibold text-emerald-400">Active Bearer Token</span>
            </div>
          </div>
        </div>

        {/* Super Admin Credentials */}
        <div className="glass-panel p-6 rounded-2xl border border-[#30363d] space-y-4">
          <div className="flex items-center gap-3 border-b border-[#30363d] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#2f9e44]/20 border border-[#2f9e44] flex items-center justify-center text-[#2f9e44]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Super Admin Account</h3>
              <p className="text-xs text-gray-400">Role-Based Access Control</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="flex items-center justify-between">
              <span>Logged Admin User:</span>
              <span className="font-bold text-white">{user?.username || 'Super Admin'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Account Email:</span>
              <span className="font-mono text-gray-300">{user?.email || 'admin@gfgcampus.org'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Assigned Security Role:</span>
              <span className="font-bold text-[#2f9e44]">{user?.role || 'Super Admin'}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
