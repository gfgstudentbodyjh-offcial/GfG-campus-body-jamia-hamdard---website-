import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, Reply as ReplyIcon, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import RoleBadge from '../common/RoleBadge';
import ContentActionMenu from '../common/ContentActionMenu';
import AuthorIdentity from '../common/AuthorIdentity';
import { resolveAvatarUrl } from '../../utils/mediaResolver';

export default function CommentSection({
  postId,
  comments = [],
  loading = false,
  currentMemberId,
  postAuthorId,
  onAddComment,
  onDeleteComment,
  onReportComment,
  showFullPageLink = true
}) {
  const [commentText, setCommentText] = useState('');
  const [activeReplyToId, setActiveReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({}); // { [commentId]: boolean }

  const scrollContainerRef = useRef(null);
  const commentsEndRef = useRef(null);

  const handleTopSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const text = commentText;
    setCommentText('');
    if (onAddComment) {
      await onAddComment(text, null);
    }
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 150);
  };

  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const text = replyText;
    setReplyText('');
    setActiveReplyToId(null);
    if (onAddComment) {
      await onAddComment(text, parentCommentId);
    }
  };

  const toggleRepliesExpand = (commentId) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  return (
    <div className="pt-4 border-t border-[#30363d] space-y-3 font-sans">
      
      {/* Fixed Discussion Header */}
      <div className="flex items-center justify-between px-1">
        <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#2f9e44]" />
          <span>Threaded Discussion</span>
          <span className="px-2 py-0.5 rounded-full bg-[#2f9e44]/15 text-[#2f9e44] border border-[#2f9e44]/30 text-[10px] font-mono font-bold">
            {comments.length}
          </span>
        </h4>

        {showFullPageLink && postId && (
          <Link
            to={`/community/post/${postId}`}
            className="text-[11px] font-mono font-bold text-[#2f9e44] hover:underline flex items-center gap-1"
          >
            Full Post Page →
          </Link>
        )}
      </div>

      {/* Fixed Comment Composer Input */}
      <form onSubmit={handleTopSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 bg-[#0a0d12] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2f9e44] transition-colors"
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="px-4 py-2.5 rounded-xl gradient-button text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Comment</span>
        </button>
      </form>

      {/* Independently Scrollable Comments Viewport */}
      <div
        ref={scrollContainerRef}
        className="max-h-[min(55vh,500px)] md:max-h-[480px] lg:max-h-[520px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-[#30363d] hover:scrollbar-thumb-[#2f9e44]/50 scrollbar-track-transparent pr-1 space-y-3 pt-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {loading ? (
          <div className="py-8 text-center space-y-2 text-gray-500 text-xs font-mono">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#2f9e44]" />
            <p>Loading discussion thread...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center space-y-1 bg-[#0a0d12] rounded-xl border border-[#30363d]/60 p-4">
            <p className="text-xs font-bold text-gray-300">No comments yet</p>
            <p className="text-[11px] text-gray-500">Be the first to join the conversation!</p>
          </div>
        ) : (
          comments.map((c) => {
            const author = c.authorRef || {};
            const authorName = author.name || 'Community Member';
            const authorPhoto = resolveAvatarUrl(author.photo, authorName);
            const authorRole = author.role || 'Member';
            const authorId = author._id || author;

            const isCommentOwner = String(authorId) === String(currentMemberId);
            const isPostOwner = String(postAuthorId) === String(currentMemberId);
            const canDeleteComment = isCommentOwner || isPostOwner;

            const replies = c.replies || [];
            const isExpanded = !!expandedReplies[c._id];
            const visibleReplies = isExpanded ? replies : replies.slice(0, 2);
            const hasMoreReplies = replies.length > 2;

            return (
              <div key={c._id} className="p-3 sm:p-3.5 rounded-xl bg-[#0a0d12] border border-[#30363d] text-xs space-y-2 relative group transition-colors hover:border-[#30363d]/90">
                
                {/* Parent Comment Header */}
                <div className="flex items-start justify-between gap-2">
                  <AuthorIdentity
                    member={author}
                    size="small"
                    showTeam={false}
                    timestamp={new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    className="flex-1"
                  />

                  <div className="flex-shrink-0 ml-1">
                    <ContentActionMenu
                      targetType="comment"
                      targetId={c._id}
                      isOwner={canDeleteComment}
                      onDelete={() => onDeleteComment && onDeleteComment(c._id)}
                      onReport={() => onReportComment && onReportComment(c._id)}
                    />
                  </div>
                </div>

                {/* Parent Comment Content Body */}
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line pl-9.5 sm:pl-10.5 font-sans">
                  {c.content}
                </p>

                {/* Lightweight Action Bar */}
                <div className="flex items-center gap-3 pl-9.5 sm:pl-10.5 pt-0.5 text-[11px] font-mono text-gray-400">
                  <button
                    type="button"
                    onClick={() => setActiveReplyToId(activeReplyToId === c._id ? null : c._id)}
                    className="hover:text-[#2f9e44] transition-colors font-bold flex items-center gap-1 py-0.5 min-h-[32px] sm:min-h-0"
                  >
                    <ReplyIcon className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Inline Reply Form */}
                {activeReplyToId === c._id && (
                  <form onSubmit={(e) => handleReplySubmit(e, c._id)} className="flex gap-2 pl-9.5 sm:pl-10.5 pt-2 animate-in fade-in slide-in-from-top-1">
                    <input
                      type="text"
                      placeholder={`Reply to ${authorName}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 bg-[#121721] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                      autoFocus
                    />
                    <button type="submit" className="px-3 py-1.5 rounded-lg gradient-button text-xs font-bold whitespace-nowrap">
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveReplyToId(null)}
                      className="px-2 py-1.5 text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {/* Nested Level-1 Replies Stream (Flattened visual indentation cap) */}
                {replies.length > 0 && (
                  <div className="ml-4 sm:ml-6 mt-2.5 pl-3 sm:pl-4 border-l-2 border-[#2f9e44]/30 space-y-2">
                    {visibleReplies.map((reply) => {
                      const replyAuthor = reply.authorRef || {};
                      const replyAuthorName = replyAuthor.name || 'Member';
                      const replyAuthorPhoto = resolveAvatarUrl(replyAuthor.photo, replyAuthorName);
                      const replyAuthorRole = replyAuthor.role || 'Member';
                      const replyAuthorId = replyAuthor._id || replyAuthor;

                      const isReplyOwner = String(replyAuthorId) === String(currentMemberId);
                      const canDeleteReply = isReplyOwner || isPostOwner;

                      return (
                        <div key={reply._id} className="p-2.5 rounded-lg bg-[#121721] border border-[#30363d]/60 space-y-1 text-xs relative">
                          <div className="flex items-start justify-between gap-2">
                            <AuthorIdentity
                              member={replyAuthor}
                              size="small"
                              showTeam={false}
                              timestamp={new Date(reply.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              className="flex-1"
                            />

                            <div className="flex-shrink-0 ml-1">
                              <ContentActionMenu
                                targetType="comment"
                                targetId={reply._id}
                                isOwner={canDeleteReply}
                                onDelete={() => onDeleteComment && onDeleteComment(reply._id)}
                                onReport={() => onReportComment && onReportComment(reply._id)}
                              />
                            </div>
                          </div>

                          <p className="text-[11px] text-gray-300 leading-relaxed pl-7 whitespace-pre-line font-sans">
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}

                    {/* View More / Hide Replies Toggle */}
                    {hasMoreReplies && (
                      <button
                        type="button"
                        onClick={() => toggleRepliesExpand(c._id)}
                        className="text-[10px] font-mono font-bold text-[#2f9e44] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            <span>Hide replies</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            <span>View {replies.length - 2} more replies</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>

    </div>
  );
}
