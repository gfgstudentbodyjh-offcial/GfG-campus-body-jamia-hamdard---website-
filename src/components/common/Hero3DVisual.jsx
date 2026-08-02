import React, { useState, useRef } from 'react';
import { Terminal, Cpu, Globe, Zap, GitBranch, Code2 } from 'lucide-react';

export default function Hero3DVisual() {
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current || window.innerWidth < 1024) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width - 0.5) * 2;
    const yPct = (mouseY / height - 0.5) * 2;

    setRot({
      x: -yPct * 5, // rotateX [-5deg, 5deg]
      y: xPct * 7   // rotateY [-7deg, 7deg]
    });
  };

  const handleMouseLeave = () => {
    setRot({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
      className="relative w-full h-[420px] sm:h-[480px] flex items-center justify-center perspective-1000 select-none cursor-default"
    >
      {/* Interactive 3D Rotatable Stage */}
      <div
        className="relative w-full max-w-lg h-full preserve-3d transition-transform duration-300 ease-out flex items-center justify-center"
        style={{
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`
        }}
      >
        {/* Ambient Radial Glow */}
        <div className="absolute w-84 h-84 bg-[#2f9e44]/18 rounded-full blur-[100px] animate-pulse-glow pointer-events-none"></div>
        <div className="absolute w-64 h-64 bg-[#06b6d4]/12 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Floating Developer Symbol 1: Code Brackets */}
        <div
          className="absolute left-2 top-10 font-mono text-3xl sm:text-4xl font-black text-[#2f9e44]/40 animate-float-slow"
          style={{ transform: 'translateZ(-30px)' }}
        >
          &lt;/&gt;
        </div>

        {/* Floating Developer Symbol 2: Curly Braces */}
        <div
          className="absolute right-4 bottom-14 font-mono text-3xl sm:text-4xl font-black text-[#06b6d4]/40 animate-float-medium"
          style={{ transform: 'translateZ(-30px)' }}
        >
          &#123; &#125;
        </div>

        {/* Floating Developer Symbol 3: Binary 01 */}
        <div
          className="absolute right-8 top-8 font-mono text-xs font-bold tracking-widest text-[#2f9e44]/50 bg-[#161b22] px-2 py-1 rounded border border-[#2f9e44]/30 animate-float-fast"
          style={{ transform: 'translateZ(-20px)' }}
        >
          01 // BINARY
        </div>

        {/* Layer 2: Floating Code Terminal Card */}
        <div
          className="absolute top-6 left-4 sm:left-8 glass-panel p-4 rounded-2xl border border-[#30363d] bg-[#121721]/95 shadow-2xl animate-float-slow w-60 sm:w-68 tech-corner"
          style={{ transform: 'translateZ(25px)' }}
        >
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#30363d]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            <span className="text-[10px] font-mono text-gray-400 ml-auto flex items-center gap-1">
              <Terminal className="w-3 h-3 text-[#2f9e44]" /> gfg --campus-body
            </span>
          </div>
          <div className="font-mono text-[11px] space-y-1 text-gray-300">
            <p><span className="text-[#2f9e44]">const</span> chapter = <span className="text-emerald-300">"Jamia Hamdard"</span>;</p>
            <p><span className="text-[#2f9e44]">const</span> status = <span className="text-cyan-400">"Developer Community"</span>;</p>
            <p><span className="text-blue-400">community.init</span>();</p>
            <p className="text-gray-400">$ npm run build<span className="animate-cursor text-[#2f9e44] font-bold">_</span></p>
          </div>
        </div>

        {/* Layer 3: Central Primary Brand Emblem Card */}
        <div
          className="relative z-10 glass-panel p-6 sm:p-8 rounded-3xl border-2 border-[#2f9e44]/50 bg-gradient-to-br from-[#121721] via-[#0a0d12] to-[#142e16] shadow-2xl flex flex-col items-center justify-center text-center space-y-3 animate-float-medium w-64 sm:w-72 tech-corner"
          style={{ transform: 'translateZ(50px)' }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 flex items-center justify-center border-2 border-[#2f9e44] shadow-xl">
            <img
              src="/assets/gfg-official-logo.png"
              alt="Official GFG Logo"
              style={{ maxHeight: '100%', maxWidth: '100%' }}
              className="w-full h-full max-h-full max-w-full object-contain"
            />
          </div>

          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg tracking-tight">GeeksforGeeks</h3>
            <span className="text-xs font-bold font-mono text-[#2f9e44] uppercase tracking-wider bg-[#2f9e44]/15 px-2.5 py-0.5 rounded-md border border-[#2f9e44]/30 inline-block mt-1">
              Campus Body
            </span>
          </div>

          <p className="text-[11px] text-gray-400 font-medium">Jamia Hamdard, New Delhi</p>
        </div>

        {/* Layer 4: Floating Tech Badges (Foreground) */}
        {/* Badge 1: Data Structures */}
        <div
          className="absolute bottom-8 left-2 sm:left-6 glass-panel px-3.5 py-2 rounded-xl border border-[#2f9e44]/50 bg-[#0a0d12]/95 shadow-xl flex items-center gap-2 text-xs font-bold text-white animate-float-fast"
          style={{ transform: 'translateZ(70px)' }}
        >
          <Cpu className="w-4 h-4 text-[#2f9e44]" />
          <span>Data Structures</span>
        </div>

        {/* Badge 2: Full-Stack Web */}
        <div
          className="absolute top-10 right-2 sm:right-6 glass-panel px-3.5 py-2 rounded-xl border border-[#06b6d4]/50 bg-[#0a0d12]/95 shadow-xl flex items-center gap-2 text-xs font-bold text-white animate-float-slow"
          style={{ transform: 'translateZ(70px)' }}
        >
          <Globe className="w-4 h-4 text-[#06b6d4]" />
          <span>Full-Stack Web</span>
        </div>

        {/* Badge 3: Hackathons */}
        <div
          className="absolute bottom-10 right-4 sm:right-8 glass-panel px-3.5 py-2 rounded-xl border border-[#2f9e44]/50 bg-[#0a0d12]/95 shadow-xl flex items-center gap-2 text-xs font-bold text-white animate-float-medium"
          style={{ transform: 'translateZ(70px)' }}
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Hackathons</span>
        </div>

      </div>
    </div>
  );
}
