import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Bookmark, Share2, Flag, Trash2, Edit3, Link as LinkIcon } from 'lucide-react';

export default function ContentActionMenu({
  targetType = 'post',
  targetId,
  isOwner = false,
  isBookmarked = false,
  onBookmark,
  onDelete,
  onReport,
  onCopyLink
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (actionFn) => {
    setIsOpen(false);
    if (actionFn) actionFn();
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-[#18202c] text-gray-400 hover:text-white transition-colors"
        title="More Actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[#121721] border border-[#30363d] shadow-2xl z-40 py-1 font-mono text-xs animate-in fade-in slide-in-from-top-2">
          
          {targetType === 'post' && onBookmark && (
            <button
              onClick={() => handleAction(onBookmark)}
              className="w-full text-left px-3.5 py-2 hover:bg-[#18202c] text-gray-200 hover:text-[#2f9e44] flex items-center gap-2 font-medium"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'text-[#2f9e44] fill-[#2f9e44]' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save Post'}</span>
            </button>
          )}

          {onCopyLink && (
            <button
              onClick={() => handleAction(onCopyLink)}
              className="w-full text-left px-3.5 py-2 hover:bg-[#18202c] text-gray-200 hover:text-white flex items-center gap-2 font-medium"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Copy Link</span>
            </button>
          )}

          {/* Own Content or Post Author Moderation: Delete */}
          {isOwner && onDelete && (
            <button
              onClick={() => handleAction(onDelete)}
              className="w-full text-left px-3.5 py-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2 font-medium border-t border-[#30363d]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete {targetType === 'post' ? 'Post' : 'Comment'}</span>
            </button>
          )}

          {/* Another Member's Content: Report */}
          {!isOwner && onReport && (
            <button
              onClick={() => handleAction(onReport)}
              className="w-full text-left px-3.5 py-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2 font-medium border-t border-[#30363d]"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report {targetType === 'post' ? 'Post' : 'Comment'}</span>
            </button>
          )}

        </div>
      )}
    </div>
  );
}
