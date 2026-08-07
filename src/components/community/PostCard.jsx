import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pin, Heart, MessageSquare, Bookmark, Share2, ExternalLink,
  FileText, Download, Image as ImageIcon, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';

import AuthorIdentity from '../common/AuthorIdentity';
import RoleBadge from '../common/RoleBadge';
import ContentActionMenu from '../common/ContentActionMenu';
import TechCard from '../common/TechCard';
import { resolveAvatarUrl, isValidMediaUrl, getStreamPdfUrl } from '../../utils/mediaResolver';

export default function PostCard({
  post,
  currentMemberId,
  user,
  onLike,
  onBookmark,
  onDelete,
  onReport,
  onOpenComments,
  onShare,
  onImageClick,
  detailMode = false
}) {
  if (!post) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  const author = post.authorRef || {};
  const authorName = author.name || 'Community Member';
  const authorPhoto = resolveAvatarUrl(author.photo, authorName);
  const authorRole = author.role || 'Member';
  const authorTeam = author.teamName || 'General';
  const authorId = author._id || author;

  const isOwner = String(authorId) === String(currentMemberId) || user?.role === 'Super Admin';

  const imageMedia = post.media?.filter(m => m.type === 'image' || (!m.type && m.url && !m.url.toLowerCase().includes('.pdf'))) || [];
  const pdfMedia = post.media?.filter(m => m.type === 'pdf' || m.resourceType === 'raw' || m.url?.toLowerCase().includes('.pdf')) || [];

  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiking(true);
    setTimeout(() => setIsLiking(false), 220);
    if (onLike) onLike(post._id);
  };

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarking(true);
    setTimeout(() => setIsBookmarking(false), 220);
    if (onBookmark) onBookmark(post._id);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/community/post/${post._id}`;
    navigator.clipboard.writeText(url);
    if (onShare) onShare(post, 'link_copied');
  };

  return (
    <TechCard
      className="p-5 sm:p-6 bg-[#121721] border-[#30363d] space-y-4 hover:border-[#2f9e44]/40 transition-all tech-corner"
    >
      {post.isPinned && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#2f9e44] bg-[#2f9e44]/15 px-3 py-1 rounded-full border border-[#2f9e44]/30 w-fit">
          <Pin className="w-3 h-3 fill-[#2f9e44]" /> Pinned Spotlight Discussion
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-start justify-between gap-2.5">
        <AuthorIdentity
          member={author}
          timestamp={new Date(post.createdAt || Date.now()).toLocaleDateString()}
          className="flex-1"
        />

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 pt-0.5">
          {post.postType && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#18202c] text-[#2f9e44] border border-[#2f9e44]/30 whitespace-nowrap">
              {post.postType}
            </span>
          )}
          <ContentActionMenu
            targetType="post"
            targetId={post._id}
            isOwner={isOwner}
            isBookmarked={post.isBookmarked}
            onBookmark={() => onBookmark && onBookmark(post._id)}
            onDelete={() => onDelete && onDelete(post._id)}
            onReport={() => onReport && onReport(post)}
            onCopyLink={handleCopyLink}
          />
        </div>
      </div>

      {/* Title & Content Body with See More / See Less & Bounded Scroll Container */}
      {(() => {
        const rawContent = post.content || '';
        const linesCount = (rawContent.match(/\n/g) || []).length + 1;
        const wordCount = rawContent.trim().split(/\s+/).filter(Boolean).length;
        const isLongContent = !detailMode && (rawContent.length > 220 || wordCount > 35 || linesCount > 4);

        return (
          <div className="space-y-2">
            {post.title && (
              <Link
                to={`/community/post/${post._id}`}
                className="text-base font-bold text-white hover:text-[#2f9e44] transition-colors leading-snug block [overflow-wrap:anywhere] [word-break:break-word]"
              >
                {post.title}
              </Link>
            )}

            {isLongContent ? (
              isExpanded ? (
                /* Expanded Mode: Full formatted text inside bounded scrollable container */
                <div className="space-y-2">
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#0a0d12]/70 border border-[#30363d]/60 max-h-[320px] sm:max-h-[420px] overflow-y-auto no-scrollbar">
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] [word-break:break-word]">
                      {rawContent}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-expanded={true}
                    onClick={() => setIsExpanded(false)}
                    className="text-xs font-bold text-[#2f9e44] hover:underline focus:outline-none flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>See less</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* Collapsed Preview Mode: 4-5 lines text preview */
                <div className="space-y-1.5">
                  <div className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] [word-break:break-word] line-clamp-4">
                    {rawContent}
                  </div>
                  <button
                    type="button"
                    aria-expanded={false}
                    onClick={() => setIsExpanded(true)}
                    className="text-xs font-bold text-[#2f9e44] hover:underline focus:outline-none flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>See more</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            ) : (
              /* Short Post / Detail Mode: Full formatted text directly */
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] [word-break:break-word]">
                {rawContent}
              </p>
            )}
          </div>
        );
      })()}

      {/* External Link */}
      {post.externalUrl && (
        <a
          href={post.externalUrl}
          target="_blank"
          rel="noreferrer"
          className="p-3 rounded-xl bg-[#0a0d12] border border-[#30363d] hover:border-[#2f9e44]/50 flex items-center justify-between text-xs transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ExternalLink className="w-3.5 h-3.5 text-[#2f9e44] flex-shrink-0" />
            <span className="text-gray-300 font-mono truncate">{post.externalUrl}</span>
          </div>
          <span className="text-[#2f9e44] font-bold text-[11px] flex-shrink-0">Open Link →</span>
        </a>
      )}

      {/* Image Media Presentation — Natural Aspect Ratio Preservation */}
      {imageMedia.length > 0 && (
        <div className="space-y-3">
          {imageMedia.map((img, idx) => (
            <div
              key={idx}
              onClick={() => onImageClick && onImageClick(img.url)}
              className="rounded-xl overflow-hidden border border-[#30363d] bg-[#0a0d12]/90 cursor-pointer group relative flex items-center justify-center min-h-[160px]"
            >
              {isValidMediaUrl(img.url) ? (
                <img
                  src={img.url}
                  alt={img.fileName || 'Attachment'}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-w-full object-contain max-h-[min(85vh,900px)] rounded-xl transition-all"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                  }}
                />
              ) : null}
              <div
                className="hidden items-center justify-center h-24 text-xs font-mono text-gray-500 gap-2"
                style={{ display: isValidMediaUrl(img.url) ? 'none' : 'flex' }}
              >
                <ImageIcon className="w-4 h-4 text-gray-600" />
                <span>Media unavailable</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Attachment List */}
      {pdfMedia.length > 0 && (
        <div className="space-y-2">
          {pdfMedia.map((pdf, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#0a0d12] border border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-[#2f9e44]/15 text-[#2f9e44] border border-[#2f9e44]/30 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{pdf.fileName || 'Study Document / Notes.pdf'}</p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    PDF Document {pdf.size ? `• ${(pdf.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                  </p>
                </div>
              </div>

              <a
                href={getStreamPdfUrl(pdf.url, { filename: pdf.fileName || 'document.pdf' })}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#18202c] hover:bg-[#2f9e44] text-white text-xs font-bold border border-[#30363d] flex items-center gap-1.5 transition-colors flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Open PDF
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Post Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] font-mono font-semibold text-[#2f9e44] bg-[#2f9e44]/10 px-2.5 py-0.5 rounded border border-[#2f9e44]/20">
              #{tag.replace('#', '')}
            </span>
          ))}
        </div>
      )}

      {/* Action Controls Bar */}
      <div className="pt-3 border-t border-[#30363d] grid grid-cols-4 sm:flex sm:items-center sm:justify-between text-xs text-gray-400 gap-1 sm:gap-6">
        <button
          onClick={handleLikeClick}
          aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
          className={`flex items-center justify-center sm:justify-start gap-1.5 font-bold transition-colors min-h-[44px] sm:min-h-0 ${
            post.isLiked ? 'text-red-400' : 'hover:text-red-400'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${post.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'} ${isLiking ? 'animate-heart-pop' : ''}`} />
          <span>{post.likesCount || 0}</span>
        </button>

        <button
          onClick={() => onOpenComments && onOpenComments(post._id)}
          className="flex items-center justify-center sm:justify-start gap-1.5 hover:text-white transition-colors font-medium min-h-[44px] sm:min-h-0"
        >
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <span className="hidden sm:inline">{post.commentsCount || 0} Comments</span>
          <span className="sm:hidden">{post.commentsCount || 0}</span>
        </button>

        <button
          onClick={handleBookmarkClick}
          aria-label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          className={`flex items-center justify-center sm:justify-start gap-1.5 font-bold transition-colors min-h-[44px] sm:min-h-0 ${
            post.isBookmarked ? 'text-[#2f9e44]' : 'hover:text-[#2f9e44]'
          }`}
        >
          <Bookmark className={`w-4 h-4 transition-transform ${post.isBookmarked ? 'text-[#2f9e44] fill-[#2f9e44]' : 'text-gray-400'} ${isBookmarking ? 'animate-bookmark-pop' : ''}`} />
          <span>{post.bookmarksCount || 0}</span>
        </button>

        <button
          onClick={() => onShare ? onShare(post) : handleCopyLink()}
          className="flex items-center justify-center sm:justify-start gap-1.5 hover:text-white transition-colors font-medium min-h-[44px] sm:min-h-0"
        >
          <Share2 className="w-4 h-4 text-gray-400" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Lightweight Feed Comment Preview */}
      {post.commentsCount > 0 && (
        <div className="pt-2.5 space-y-2 border-t border-[#30363d]/50 text-xs">
          <button
            type="button"
            onClick={() => onOpenComments && onOpenComments(post._id)}
            className="text-[11px] font-mono font-bold text-gray-400 hover:text-[#2f9e44] transition-colors"
          >
            View all {post.commentsCount} comments →
          </button>

          {post.previewComments && post.previewComments.length > 0 && (
            <div className="space-y-1.5">
              {post.previewComments.slice(0, 2).map((c, i) => (
                <div key={c._id || i} className="flex items-start gap-2 bg-[#0a0d12]/60 p-2 rounded-lg border border-[#30363d]/40">
                  <AuthorIdentity member={c.authorRef} size="small" showRole={false} showTeam={false} className="flex-shrink-0" />
                  <p className="text-gray-300 text-xs truncate flex-1 self-center">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </TechCard>
  );
}
