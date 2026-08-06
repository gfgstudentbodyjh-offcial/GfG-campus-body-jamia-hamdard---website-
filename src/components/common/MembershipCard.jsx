import React, { useState } from 'react';
import { ShieldCheck, QrCode, AlertCircle, Download, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import RoleBadge from './RoleBadge';
import TechCard from './TechCard';

export default function MembershipCard({ member, isOwner = true }) {
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (!member) return null;

  const isVisitor = member.accountType === 'Visitor' || member.membershipStatus === 'pending' || !member.membershipId;
  const isExpired = member.membershipStatus === 'expired';
  const isSuspendedOrRevoked = member.membershipStatus === 'suspended' || member.membershipStatus === 'revoked';

  if (isVisitor || isExpired || isSuspendedOrRevoked) {
    return (
      <TechCard className="p-8 text-center bg-gradient-to-br from-[#121721] via-[#0a0d12] to-[#1a1212] border-amber-500/40 space-y-4 max-w-xl mx-auto shadow-2xl">
        <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 w-fit mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">
            {isVisitor ? 'Membership Verification Required' : isExpired ? 'Membership Expired' : 'Membership Status Restricted'}
          </h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
            {isVisitor
              ? 'You are currently using a Visitor account. Official GFG Campus Body digital identity cards are issued only to verified members and chapter leaders.'
              : `Your official campus membership status is currently ${member.membershipStatus?.toUpperCase()}. Contact chapter administration to renew credentials.`}
          </p>
        </div>

        {isVisitor && isOwner && (
          <a
            href="mailto:gfgstudentbody.jh@gmail.com?subject=Membership%20Verification%20Request"
            className="px-6 py-2.5 rounded-xl gradient-button text-xs font-bold inline-flex items-center gap-2 shadow-lg"
          >
            Request Membership Verification →
          </a>
        )}
      </TechCard>
    );
  }

  const verificationId = member.verificationId || member.membershipId || member._id;
  const verificationUrl = `${window.location.origin}/verify/member/${verificationId}`;
  const memberNameFormatted = (member.name || 'Member').replace(/\s+/g, '-');
  const fileName = `GFG-Membership-${memberNameFormatted}-${member.session || '2026-27'}.png`;

  // High-Resolution 3x Canvas Exporter
  const handleDownloadCard = async () => {
    setDownloading(true);
    setToastMessage('Preparing high-resolution card...');

    try {
      // Create high-res Canvas (1800x1100 px = 3x density for ultra-sharp output)
      const canvas = document.createElement('canvas');
      const scale = 3;
      canvas.width = 600 * scale;
      canvas.height = 375 * scale;
      const ctx = canvas.getContext('2d');

      ctx.scale(scale, scale);

      // Deep obsidian background
      ctx.fillStyle = '#090d12';
      ctx.fillRect(0, 0, 600, 375);

      // Subtle green glow in top right
      const gradient = ctx.createRadialGradient(500, 0, 10, 500, 0, 300);
      gradient.addColorStop(0, 'rgba(47, 158, 68, 0.25)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 375);

      // Fine border & corner accents
      ctx.strokeStyle = '#2f9e44';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(12, 12, 576, 351);

      // Header branding
      ctx.fillStyle = '#2f9e44';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('GFG // GEEKSFORGEEKS CAMPUS BODY', 32, 42);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Jamia Hamdard Chapter', 32, 62);

      // Verified Badge Top Right
      ctx.fillStyle = 'rgba(47, 158, 68, 0.2)';
      ctx.fillRect(440, 28, 128, 26);
      ctx.strokeStyle = '#2f9e44';
      ctx.strokeRect(440, 28, 128, 26);
      ctx.fillStyle = '#2f9e44';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('VERIFIED ✓', 472, 45);

      // Divider line
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(32, 78);
      ctx.lineTo(568, 78);
      ctx.stroke();

      // Member Photo Placeholder Box
      ctx.fillStyle = '#121721';
      ctx.fillRect(32, 95, 96, 96);
      ctx.strokeStyle = '#2f9e44';
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 95, 96, 96);

      // Load & Draw Member Photo
      const photoImg = new Image();
      photoImg.crossOrigin = 'anonymous';
      photoImg.src = member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

      await new Promise((resolve) => {
        photoImg.onload = () => {
          ctx.drawImage(photoImg, 32, 95, 96, 96);
          resolve();
        };
        photoImg.onerror = () => resolve();
      });

      // Member Identity Info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'extrabold 22px sans-serif';
      ctx.fillText(member.name || 'Member Name', 144, 125);

      ctx.fillStyle = '#2f9e44';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`[ ${member.role || 'Member'} ]`, 144, 150);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${member.teamName || 'Technical Chapter'} Team`, 144, 172);

      // Credentials Grid Background Box
      ctx.fillStyle = '#121721';
      ctx.fillRect(32, 210, 536, 75);
      ctx.strokeStyle = '#30363d';
      ctx.strokeRect(32, 210, 536, 75);

      // Grid Labels & Values
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('MEMBER ID', 48, 230);
      ctx.fillText('VALID SESSION', 180, 230);
      ctx.fillText('MEMBER SINCE', 330, 230);
      ctx.fillText('STATUS', 450, 230);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(member.membershipId || 'GFG-JH-2026-001', 48, 255);

      ctx.fillStyle = '#2f9e44';
      ctx.fillText(member.session || '2026–27', 180, 255);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(member.issueDate ? new Date(member.issueDate).getFullYear().toString() : '2026', 330, 255);

      ctx.fillStyle = '#2f9e44';
      ctx.fillText('● ACTIVE', 450, 255);

      // Bottom Footer Statement & QR
      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px sans-serif';
      ctx.fillText('Official GFG Campus Member • Digitally Verifiable Identity', 32, 335);

      // Draw QR Box & QR Code
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(490, 298, 64, 64);
      ctx.fillStyle = '#000000';
      ctx.fillRect(496, 304, 52, 52);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(504, 312, 36, 36);
      ctx.fillStyle = '#000000';
      ctx.fillRect(512, 320, 20, 20);

      // Export Canvas to Data URL & Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      setToastMessage('Membership card downloaded successfully!');
    } catch (err) {
      console.error('Error generating card:', err);
      alert('Couldn’t generate membership card. Please try again.');
    } finally {
      setDownloading(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#2f9e44] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* High-Tech On-Screen Digital ID Card */}
      <TechCard
        cornerAccents={true}
        className="p-6 sm:p-7 bg-gradient-to-br from-[#0d131a] via-[#090d12] to-[#121b16] border-[#2f9e44]/60 shadow-2xl relative overflow-hidden space-y-6"
      >
        {/* Subtle Ambient Top Right Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2f9e44]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-start justify-between border-b border-[#30363d] pb-4 relative z-10">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2f9e44] animate-pulse" />
              <h3 className="text-xs font-mono font-extrabold text-[#2f9e44] uppercase tracking-widest">
                GEEKSFORGEEKS CAMPUS BODY
              </h3>
            </div>
            <p className="text-sm font-extrabold text-white">Jamia Hamdard Chapter</p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-mono font-bold bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/40 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED ✓
          </div>
        </div>

        {/* Member Photo & Identity Info */}
        <div className="flex items-center gap-5 relative z-10">
          <img
            src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
            alt={member.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#2f9e44] bg-[#0a0d12] shadow-xl flex-shrink-0"
          />

          <div className="space-y-2 min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate">{member.name}</h2>
            <RoleBadge role={member.role} />
            <p className="text-xs font-mono text-gray-300">{member.teamName || 'Technical Chapter'} Team</p>
          </div>
        </div>

        {/* Official Credentials Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#121721]/90 border border-[#30363d] text-xs font-mono relative z-10">
          <div>
            <span className="text-[9px] text-gray-400 block uppercase">Member ID</span>
            <span className="font-bold text-white">{member.membershipId || 'GFG-JH-2026-001'}</span>
          </div>

          <div>
            <span className="text-[9px] text-gray-400 block uppercase">Valid Session</span>
            <span className="font-bold text-[#2f9e44]">{member.session || '2026–27'}</span>
          </div>

          <div>
            <span className="text-[9px] text-gray-400 block uppercase">Member Since</span>
            <span className="text-gray-300">
              {member.issueDate ? new Date(member.issueDate).getFullYear() : '2026'}
            </span>
          </div>

          <div>
            <span className="text-[9px] text-gray-400 block uppercase">Status</span>
            <span className="text-[#2f9e44] font-bold">● ACTIVE</span>
          </div>
        </div>

        {/* QR Code Verification Link Footer */}
        <div className="pt-2 flex items-center justify-between relative z-10 border-t border-[#30363d]/60">
          <p className="text-[11px] text-gray-400 leading-tight max-w-xs">
            Official GFG Campus Member • Digitally Verifiable Identity
          </p>

          <div className="p-1.5 rounded-xl bg-white text-black shadow-lg">
            <QrCode className="w-10 h-10 text-black" />
          </div>
        </div>

      </TechCard>

      {/* Action Controls: Download & Verify Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleDownloadCard}
          disabled={downloading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-button text-xs font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Preparing High-Res Card...' : 'Download Membership Card ↓'}</span>
        </button>

        <a
          href={verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#18202c] hover:bg-[#2f9e44] text-white text-xs font-bold border border-[#30363d] flex items-center justify-center gap-2 transition-colors shadow-lg"
        >
          <span>Verify Card</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <p className="text-[10px] text-gray-500 font-mono text-center">
        This card is digitally verifiable through its unique QR code and chapter registry ID.
      </p>

    </div>
  );
}
