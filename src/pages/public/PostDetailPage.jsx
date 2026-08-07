import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import {
  ArrowLeft, Heart, MessageSquare, Bookmark, Share2, Pin,
  FileText, Image as ImageIcon, Send, Download, ExternalLink, ShieldCheck, Trash2
} from 'lucide-react';
import TechCard from '../../components/common/TechCard';
import RoleBadge from '../../components/common/RoleBadge';
import CommentSection from '../../components/community/CommentSection';
import { useAuth } from '../../context/AuthContext';
import { patchCachedPost } from '../../utils/communityCache';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, member: authMember, requireAuthAction } = useAuth();
  const currentMemberId = authMember?._id || user?.id || user?._id;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [activeReplyToId, setActiveReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const isLikingRef = React.useRef(false);
  const isBookmarkingRef = React.useRef(false);

  useEffect(() => {
    loadPostAndComments();
  }, [postId]);

  const loadPostAndComments = async () => {
    setLoading(true);
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/${postId}`),
        api.get(`/posts/${postId}/comments`)
      ]);
      setPost(postRes.data.data);
      setComments(commentsRes.data.data || []);
    } catch (err) {
      console.warn('Failed loading post detail:', err);
    }
    setLoading(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLike = async () => {
    if (!post) return;
    if (!requireAuthAction(null, 'like posts')) return;
    if (isLikingRef.current) return;
    isLikingRef.current = true;

    const previousLiked = post.isLiked;
    const previousCount = post.likesCount || 0;
    const nextLiked = !previousLiked;
    const nextCount = nextLiked ? previousCount + 1 : Math.max(0, previousCount - 1);

    // INSTANT OPTIMISTIC UPDATE
    setPost(prev => ({ ...prev, isLiked: nextLiked, likesCount: nextCount }));
    patchCachedPost(post._id, { isLiked: nextLiked, likesCount: nextCount });

    try {
      const res = await api.post(`/posts/${post._id}/like`);
      if (res.data?.success || res.data?.isLiked !== undefined) {
        const serverCount = res.data.likesCount !== undefined ? res.data.likesCount : nextCount;
        const serverLiked = res.data.isLiked !== undefined ? res.data.isLiked : nextLiked;
        setPost(prev => ({ ...prev, likesCount: serverCount, isLiked: serverLiked }));
        patchCachedPost(post._id, { likesCount: serverCount, isLiked: serverLiked });
      }
    } catch (err) {
      console.warn('Like toggle failed:', err);
      setPost(prev => ({ ...prev, isLiked: previousLiked, likesCount: previousCount }));
      patchCachedPost(post._id, { isLiked: previousLiked, likesCount: previousCount });
      showToast("Couldn't update like.");
    } finally {
      isLikingRef.current = false;
    }
  };

  const handleBookmark = async () => {
    if (!post) return;
    if (!requireAuthAction(null, 'save posts')) return;
    if (isBookmarkingRef.current) return;
    isBookmarkingRef.current = true;

    const previousBookmarked = post.isBookmarked;
    const previousCount = post.bookmarksCount || 0;
    const nextBookmarked = !previousBookmarked;
    const nextCount = nextBookmarked ? previousCount + 1 : Math.max(0, previousCount - 1);

    // INSTANT OPTIMISTIC UPDATE
    setPost(prev => ({ ...prev, isBookmarked: nextBookmarked, bookmarksCount: nextCount }));
    patchCachedPost(post._id, { isBookmarked: nextBookmarked, bookmarksCount: nextCount });

    try {
      const res = await api.post(`/posts/${post._id}/bookmark`);
      if (res.data?.success || res.data?.isBookmarked !== undefined) {
        const serverCount = res.data.bookmarksCount !== undefined ? res.data.bookmarksCount : nextCount;
        const serverBookmarked = res.data.isBookmarked !== undefined ? res.data.isBookmarked : nextBookmarked;
        setPost(prev => ({ ...prev, bookmarksCount: serverCount, isBookmarked: serverBookmarked }));
        patchCachedPost(post._id, { bookmarksCount: serverCount, isBookmarked: serverBookmarked });
        showToast(serverBookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks');
      }
    } catch (err) {
      console.warn('Bookmark toggle failed:', err);
      setPost(prev => ({ ...prev, isBookmarked: previousBookmarked, bookmarksCount: previousCount }));
      patchCachedPost(post._id, { isBookmarked: previousBookmarked, bookmarksCount: previousCount });
      showToast("Couldn't save post.");
    } finally {
      isBookmarkingRef.current = false;
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title || 'GFG Community Post', url });
      } catch (e) {
        // Share cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Post link copied to clipboard!');
    }
  };

  const handleAddComment = async (e, parentCommentId = null) => {
    e.preventDefault();
    const text = parentCommentId ? replyText : commentText;
    if (!text.trim()) return;

    try {
      const res = await api.post(`/posts/${postId}/comments`, {
        content: text,
        parentCommentId
      });

      if (parentCommentId) {
        setComments(prev => prev.map(c => {
          if (c._id === parentCommentId) {
            return { ...c, replies: [...(c.replies || []), res.data.data] };
          }
          return c;
        }));
        setReplyText('');
        setActiveReplyToId(null);
      } else {
        setComments(prev => [...prev, res.data.data]);
        setCommentText('');
      }

      setPost(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
      showToast(parentCommentId ? 'Reply published' : 'Comment published');
    } catch (err) {
      alert('Failed publishing comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/posts/comments/${commentId}`);
      loadPostAndComments();
      showToast('Comment deleted');
    } catch (err) {
      alert('Failed deleting comment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center font-mono text-gray-400">Loading Discussion...</div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 py-16 px-4 text-center space-y-4 max-w-xl mx-auto">
          <p className="text-lg font-bold text-white">Post not found or has been removed</p>
          <button onClick={() => navigate('/community')} className="px-6 py-2.5 rounded-xl gradient-button text-xs font-bold inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Community Feed
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const imageMedia = post.media?.filter(m => m.type === 'image') || [];
  const pdfMedia = post.media?.filter(m => m.type === 'pdf') || [];

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#2f9e44] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Back Link */}
        <Link to="/community" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#2f9e44]" /> Back to Community Feed
        </Link>

        {/* Main Post Card */}
        <TechCard className="p-6 sm:p-8 bg-[#121721] border-[#30363d] space-y-6">
          
          {post.isPinned && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#2f9e44] bg-[#2f9e44]/15 px-3 py-1 rounded-full border border-[#2f9e44]/30 w-fit">
              <Pin className="w-3 h-3 fill-[#2f9e44]" /> Pinned Spotlight Discussion
            </div>
          )}

          {/* Author Header */}
          <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <img
                  src={post.authorRef?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                  alt={post.authorRef?.name || 'Member'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#2f9e44] shadow-md"
                />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="font-bold text-white text-base hover:text-[#2f9e44] leading-snug">
                    {post.authorRef?.name || 'Community Member'}
                  </Link>
                  <RoleBadge role={post.authorRef?.role} />
                </div>
                <p className="text-xs text-gray-400">
                  {post.authorRef?.teamName || 'Technical Chapter'} • <span className="font-mono text-[10px]">{new Date(post.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#18202c] text-[#2f9e44] border border-[#2f9e44]/30">
              {post.postType}
            </span>
          </div>

          {/* Body Content */}
          <div className="space-y-3">
            {post.title && <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{post.title}</h1>}
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed whitespace-pre-line">{post.content}</p>
          </div>

          {/* External Link */}
          {post.externalUrl && (
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-xl bg-[#0a0d12] border border-[#30363d] hover:border-[#2f9e44]/50 flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <ExternalLink className="w-4 h-4 text-[#2f9e44] flex-shrink-0" />
                <span className="text-gray-300 font-mono truncate">{post.externalUrl}</span>
              </div>
              <span className="text-[#2f9e44] font-bold flex-shrink-0">Visit Link →</span>
            </a>
          )}

          {/* Image Attachments */}
          {imageMedia.length > 0 && (
            <div className="space-y-4">
              {imageMedia.map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden max-h-[500px] border border-[#30363d] bg-black/40">
                  <img src={img.url} alt={img.fileName || 'Post image'} className="w-full h-full object-contain max-h-[500px]" />
                </div>
              ))}
            </div>
          )}

          {/* PDF Attachments */}
          {pdfMedia.length > 0 && (
            <div className="space-y-3">
              {pdfMedia.map((pdf, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#0a0d12] border border-[#30363d] flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 rounded-xl bg-[#2f9e44]/15 text-[#2f9e44] border border-[#2f9e44]/30 flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{pdf.fileName || 'Study Document / Notes.pdf'}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        PDF Document • {pdf.size ? `${(pdf.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF Note'}
                      </p>
                    </div>
                  </div>

                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#18202c] hover:bg-[#2f9e44] text-white text-xs font-bold border border-[#30363d] flex items-center gap-2 transition-colors flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Open PDF
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#30363d]/60">
              {post.tags.map((tag, idx) => (
                <span key={idx} className="text-xs font-mono font-semibold text-[#2f9e44] bg-[#2f9e44]/10 px-3 py-1 rounded-lg border border-[#2f9e44]/25">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 border-t border-[#30363d] flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 font-bold transition-colors ${
                  post.isLiked ? 'text-red-400' : 'hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                <span>{post.likesCount || 0} Likes</span>
              </button>

              <div className="flex items-center gap-2 font-bold text-gray-300">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <span>{post.commentsCount || 0} Comments</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-1.5 font-bold transition-colors ${
                  post.isBookmarked ? 'text-[#2f9e44]' : 'hover:text-[#2f9e44]'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'text-[#2f9e44] fill-[#2f9e44]' : 'text-gray-400'}`} />
                <span>{post.bookmarksCount || 0} Saved</span>
              </button>

              <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-white transition-colors font-bold">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>

        </TechCard>

        {/* Discussion Section */}
        <TechCard className="p-5 sm:p-6 bg-[#121721] border-[#30363d]">
          <CommentSection
            postId={postId}
            comments={comments}
            currentMemberId={currentMemberId}
            postAuthorId={post.authorRef?._id || post.authorRef}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onReportComment={(cid) => setReportingTarget({ targetType: 'comment', targetId: cid })}
            showFullPageLink={false}
          />
        </TechCard>

      </main>

      <Footer />
    </div>
  );
}
