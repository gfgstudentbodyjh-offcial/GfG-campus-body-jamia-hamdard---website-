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

  const renderTrackChildren = (prefix) => {
    return React.Children.map(children, (child, idx) => {
      if (!React.isValidElement(child)) return child;
      // Strip React's internal ".$" prefix from child.key to get the raw key
      const rawKey = child.key != null ? String(child.key).replace(/^\.?\$?/, '') : String(idx);
      return React.cloneElement(child, { key: `${prefix}-${rawKey}-${idx}` });
    });
  };

  return (
    <div
      className={`relative w-full overflow-hidden marquee-mask marquee-container ${className}`}
      style={{ '--marquee-duration': `${duration}s` }}
    >
      <div className={`${animationClass} flex ${gapClass} py-2`}>
        {/* Track 1 */}
        <div className={`flex ${gapClass} items-stretch flex-shrink-0`}>
          {renderTrackChildren('t1')}
        </div>
        {/* Track 2 (Duplicate for 100% seamless infinite loop) */}
        <div className={`flex ${gapClass} items-stretch flex-shrink-0`} aria-hidden="true">
          {renderTrackChildren('t2')}
        </div>
      </div>
    </div>
  );
}
