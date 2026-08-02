import React from 'react';

/**
 * InfiniteMarquee — Continuous auto-looping marquee across mobile & desktop
 */
export default function InfiniteMarquee({
  direction = 'left',
  duration = 35,
  gapClass = 'gap-5',
  className = '',
  children
}) {
  const animationClass = direction === 'right' ? 'animate-marquee-right' : 'animate-marquee-left';

  return (
    <div
      className={`relative w-full overflow-hidden marquee-mask marquee-container ${className}`}
      style={{ '--marquee-duration': `${duration}s` }}
    >
      <div className={`${animationClass} flex ${gapClass} py-2`}>
        {/* Track 1 */}
        <div className={`flex ${gapClass} items-stretch flex-shrink-0`}>
          {children}
        </div>
        {/* Track 2 (Duplicate for 100% seamless infinite loop) */}
        <div className={`flex ${gapClass} items-stretch flex-shrink-0`} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
