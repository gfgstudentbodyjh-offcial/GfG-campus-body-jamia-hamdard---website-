import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import {
  Sparkles, FileText, Award, HelpCircle, Briefcase, Code2, Search, Plus,
  Heart, MessageSquare, Bookmark, Share2, Pin, X, Send, Download, ExternalLink,
  ShieldCheck, Upload, Trash2, Calendar, Users, TrendingUp, Compass, BookmarkCheck,
  CheckCircle2, AlertCircle, Loader2, Image as ImageIcon
} from 'lucide-react';
import TechCard from '../../components/common/TechCard';
import InCampusPromo from '../../components/common/InCampusPromo';
import RoleBadge from '../../components/common/RoleBadge';
import ContentActionMenu from '../../components/common/ContentActionMenu';
import ReportModal from '../../components/common/ReportModal';

import { useAuth } from '../../context/AuthContext';

export default function CommunityFeed() {
  const navigate = useNavigate();
  const { user, member: authMember, isAuthenticated, openAuthModal } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation & Filter states
  const [activeNav, setActiveNav] = useState('For You');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [search, setSearch] = useState('');
  
  // Create Post Composer states
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [postType, setPostType] = useState('Thought');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('DSA, WebDev');
  
  // Local File Upload & Preview States
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState(null);

  const fileInputRef = useRef(null);

  // Threaded Discussion Drawer State per Post
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [activeReplyToId, setActiveReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Logged-in member identity
  const currentMemberId = authMember?._id || user?.id || 'm_saquib';

  // Toast & Report State
  const [toastMessage, setToastMessage] = useState('');
  const [reportingTarget, setReportingTarget] = useState(null);

  const categories = [
    { name: 'All', icon: Sparkles },
    { name: 'Thought', icon: FileText },
    { name: 'Study Note', icon: FileText },
    { name: 'Achievement', icon: Award },
    { name: 'Question', icon: HelpCircle },
    { name: 'Opportunity', icon: Briefcase },
    { name: 'Project', icon: Code2 }
  ];

  const popularTags = ['#All', '#DSA', '#WebDevelopment', '#AI', '#Placement', '#Projects', '#Hackathon', '#Notes', '#Question'];

  const trendingTopics = [
    { tag: '#DSA', count: '142 posts' },
    { tag: '#WebDevelopment', count: '98 posts' },
    { tag: '#Placement', count: '76 posts' },
    { tag: '#AI', count: '54 posts' },
    { tag: '#Hackathon', count: '41 posts' }
  ];

  const activeMembers = [
    { name: 'Saquib Sarfaraz', role: 'Campus Mantri', photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' },
    { name: 'Aisha Khan', role: 'Technical Lead', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
    { name: 'Arham Raza', role: 'Event Lead', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' }
  ];

  useEffect(() => {
    loadPosts();
  }, [activeNav, typeFilter, selectedTag, search]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts', {
        params: {
          filter: activeNav,
          type: typeFilter,
          tag: selectedTag,
          search
        }
      });
      setPosts(res.data.data || []);
    } catch (err) {
      console.warn('Failed loading feed posts:', err);
    }
    setLoading(false);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Instant Local File Selection + Background Cloudinary Upload
  const handleFileSelect = async (e, forcedType = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const detectedType = forcedType || (file.type.startsWith('image/') ? 'image' : 'pdf');
    setSelectedFile(file);
    setFileType(detectedType);

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setFilePreviewUrl(localUrl);

    // Background upload to backend / Cloudinary
    setIsUploading(true);
    setUploadProgress(25);

    const formData = new FormData();
    formData.append('mediaFile', file);
    formData.append('folder', detectedType === 'pdf' ? 'Documents' : 'Posts');

    try {
      setUploadProgress(65);
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress(100);

      const mediaAsset = {
        type: detectedType,
        url: res.data.data.url,
        publicId: res.data.data.publicId,
        fileName: file.name,
        mimeType: file.type,
        size: file.size
      };

      setUploadedMedia(mediaAsset);
      setIsUploading(false);
      showToast(`${detectedType.toUpperCase()} file uploaded successfully`);
    } catch (err) {
      console.warn('Media upload failed, using fallback:', err);
      // Local fallback url if server offline
      setUploadedMedia({
        type: detectedType,
        url: localUrl,
        publicId: `local_${Date.now()}`,
        fileName: file.name,
        mimeType: file.type,
        size: file.size
      });
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setFileType(null);
    setUploadedMedia(null);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const mediaList = uploadedMedia ? [uploadedMedia] : [];
    const parsedTags = tagsInput.split(',').map(t => t.trim().replace('#', '')).filter(Boolean);

    try {
      const payload = {
        postType,
        title,
        content,
        media: mediaList,
        externalUrl,
        tags: parsedTags
      };

      const res = await api.post('/posts', payload);
      setPosts(prev => [res.data.data, ...prev]);
      setIsComposerOpen(false);
      
      // Reset form
      setTitle('');
      setContent('');
      setExternalUrl('');
      setTagsInput('DSA, WebDev');
      handleRemoveMedia();
      showToast('Community post published!');
    } catch (err) {
      alert('Failed creating post: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return {
            ...p,
            likesCount: res.data.likesCount,
            isLiked: res.data.isLiked
          };
        }
        return p;
      }));
    } catch (err) {
      console.warn('Like toggle failed:', err);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/bookmark`);
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return {
            ...p,
            bookmarksCount: res.data.bookmarksCount,
            isBookmarked: res.data.isBookmarked
          };
        }
        return p;
      }));
      showToast(res.data.isBookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks');
    } catch (err) {
      console.warn('Bookmark toggle failed:', err);
    }
  };

  const handleShare = async (post) => {
    const shareUrl = `${window.location.origin}/community/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title || 'GFG Community Post', url: shareUrl });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Post link copied to clipboard!');
    }
  };

  const handleOpenComments = async (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }
    setActiveCommentPostId(postId);
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setPostComments(res.data.data || []);
    } catch (err) {
      console.warn('Error fetching post comments:', err);
    }
  };

  const handleAddComment = async (e, parentCommentId = null) => {
    e.preventDefault();
    const text = parentCommentId ? replyText : commentText;
    if (!text.trim() || !activeCommentPostId) return;

    try {
      const res = await api.post(`/posts/${activeCommentPostId}/comments`, {
        content: text,
        parentCommentId
      });

      if (parentCommentId) {
        setPostComments(prev => prev.map(c => {
          if (c._id === parentCommentId) {
            return { ...c, replies: [...(c.replies || []), res.data.data] };
          }
          return c;
        }));
        setReplyText('');
        setActiveReplyToId(null);
      } else {
        setPostComments(prev => [...prev, res.data.data]);
        setCommentText('');
      }

      setPosts(prev => prev.map(p => p._id === activeCommentPostId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      showToast('Reply added');
    } catch (err) {
      alert('Failed adding comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Remove comment from discussion?')) return;
    try {
      await api.delete(`/posts/comments/${commentId}`, { data: { memberId: currentMemberId } });
      setPostComments(prev => prev.filter(c => c._id !== commentId).map(c => ({
        ...c,
        replies: (c.replies || []).filter(r => r._id !== commentId)
      })));
      setPosts(prev => prev.map(p => p._id === activeCommentPostId ? { ...p, commentsCount: Math.max(0, (p.commentsCount || 1) - 1) } : p));
      showToast('Comment removed');
    } catch (err) {
      setPostComments(prev => prev.filter(c => c._id !== commentId));
    }
  };

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

      {/* Hidden File Input — Strict MIME filtering */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={fileType === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp,image/gif'}
        onChange={(e) => handleFileSelect(e, fileType)}
      />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ─── LEFT SIDEBAR (DESKTOP NAVIGATION) ─────────────────────────── */}
          <aside className="lg:col-span-3 hidden lg:block space-y-6 sticky top-24 max-h-[calc(100vh-6.5rem)] overflow-y-auto pr-1">
            
            {/* Feed Navigation Card */}
            <div className="p-4 rounded-2xl bg-[#121721] border border-[#30363d] space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider block px-3 pb-2 border-b border-[#30363d]/60">
                01 // COMMUNITY FEED
              </span>

              {[
                { name: 'For You', icon: Sparkles },
                { name: 'Latest', icon: TrendingUp },
                { name: 'Study Notes', icon: FileText },
                { name: 'Questions', icon: HelpCircle },
                { name: 'Projects', icon: Code2 },
                { name: 'Achievements', icon: Award },
                { name: 'Saved', icon: BookmarkCheck },
                { name: 'My Posts', icon: FileText }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activeNav === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveNav(item.name)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#2f9e44] text-white shadow-md shadow-[#2f9e44]/20 border border-[#2f9e44]'
                        : 'text-gray-400 hover:text-white hover:bg-[#18202c]'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Discover Shortcuts */}
            <div className="p-4 rounded-2xl bg-[#121721] border border-[#30363d] space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider block border-b border-[#30363d]/60 pb-2">
                02 // DISCOVER MODULES
              </span>

              <div className="space-y-1 text-xs">
                <Link to="/events" className="flex items-center gap-2.5 p-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#18202c]">
                  <Calendar className="w-4 h-4 text-[#2f9e44]" />
                  <span>Events & Hackathons</span>
                </Link>
                <Link to="/resources" className="flex items-center gap-2.5 p-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#18202c]">
                  <Compass className="w-4 h-4 text-[#06b6d4]" />
                  <span>Resource Library</span>
                </Link>
                <Link to="/leaderboard" className="flex items-center gap-2.5 p-2 rounded-xl text-gray-300 hover:text-white hover:bg-[#18202c]">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span>Student Leaderboard</span>
                </Link>
              </div>
            </div>

          </aside>

          {/* ─── CENTER COLUMN (MAIN FEED STREAM) ─────────────────────────── */}
          <section className="lg:col-span-6 w-full max-w-[740px] mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
              <div>
                <span className="text-[10px] font-mono text-[#2f9e44] uppercase tracking-wider font-bold block">
                  COMMUNITY NETWORK
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Community Feed</h1>
              </div>

              <button
                onClick={() => setIsComposerOpen(true)}
                className="px-4 py-2.5 rounded-xl gradient-button text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#2f9e44]/25"
              >
                <Plus className="w-4 h-4" /> Create Post
              </button>
            </div>

            {/* Create Post Entry Trigger */}
            <TechCard
              onClick={() => setIsComposerOpen(true)}
              className="p-4 bg-[#121721] border-[#30363d] hover:border-[#2f9e44]/50 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80"
                  alt="Member avatar"
                  className="w-10 h-10 rounded-full object-cover border border-[#2f9e44]"
                />
                <div className="flex-1 bg-[#0a0d12] border border-[#30363d] rounded-xl px-4 py-2.5 text-xs text-gray-400">
                  Share something with the community...
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#30363d]/60 text-xs font-semibold text-gray-400">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileType('image');
                    setIsComposerOpen(true);
                    setTimeout(() => fileInputRef.current?.click(), 200);
                  }}
                  className="flex items-center gap-1.5 hover:text-white px-2 py-1 rounded-lg hover:bg-[#18202c]"
                >
                  <ImageIcon className="w-4 h-4 text-[#2f9e44]" /> Photo
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileType('pdf');
                    setIsComposerOpen(true);
                    setTimeout(() => fileInputRef.current?.click(), 200);
                  }}
                  className="flex items-center gap-1.5 hover:text-white px-2 py-1 rounded-lg hover:bg-[#18202c]"
                >
                  <FileText className="w-4 h-4 text-[#06b6d4]" /> PDF Note
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPostType('Question');
                    setIsComposerOpen(true);
                  }}
                  className="flex items-center gap-1.5 hover:text-white px-2 py-1 rounded-lg hover:bg-[#18202c]"
                >
                  <HelpCircle className="w-4 h-4 text-yellow-400" /> Question
                </button>
              </div>
            </TechCard>

            {/* Category Filter Pills & Search */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = typeFilter === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setTypeFilter(cat.name)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                        isSelected
                          ? 'bg-[#2f9e44] text-white shadow-md border border-[#2f9e44]'
                          : 'bg-[#121721] text-gray-400 hover:text-white border border-[#30363d]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, topics, or notes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#121721] border border-[#30363d] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2f9e44]"
                />
              </div>
            </div>

            {/* Active Tag Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pb-1">
              <span className="text-gray-500 font-mono font-bold flex-shrink-0">TAGS:</span>
              {popularTags.map(tag => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/40 font-bold'
                        : 'bg-[#121721] text-gray-400 hover:text-white border border-[#30363d]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Stream of Feed Cards */}
            {loading ? (
              <div className="space-y-4 py-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-6 rounded-2xl bg-[#121721] border border-[#30363d] animate-pulse space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#21262d]" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-32 bg-[#21262d] rounded" />
                        <div className="h-3 w-20 bg-[#21262d] rounded" />
                      </div>
                    </div>
                    <div className="h-16 bg-[#21262d] rounded-xl" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <TechCard className="p-12 text-center bg-[#121721] border-[#30363d] space-y-3">
                <p className="text-base font-bold text-white">No community posts found</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Be the first to share a study note, project update, question, or achievement with fellow chapter members!
                </p>
                <button onClick={() => setIsComposerOpen(true)} className="px-5 py-2.5 rounded-xl gradient-button text-xs font-bold inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create First Post
                </button>
              </TechCard>
            ) : (
              <div className="space-y-6">
                {posts.map((post, index) => {
                  const imageMedia = post.media?.filter(m => m.type === 'image') || [];
                  const pdfMedia = post.media?.filter(m => m.type === 'pdf') || [];

                  return (
                    <React.Fragment key={post._id}>
                      <TechCard
                        className="p-5 sm:p-6 bg-[#121721] border-[#30363d] space-y-4 hover:border-[#2f9e44]/40 transition-all tech-corner"
                      >
                        {post.isPinned && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#2f9e44] bg-[#2f9e44]/15 px-3 py-1 rounded-full border border-[#2f9e44]/30 w-fit">
                            <Pin className="w-3 h-3 fill-[#2f9e44]" /> Pinned Spotlight Discussion
                          </div>
                        )}

                        {/* Author Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Link to={`/profile`}>
                              <img
                                src={post.authorRef?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                                alt={post.authorRef?.name || 'Member'}
                                className="w-10 h-10 rounded-full object-cover border border-[#2f9e44]"
                              />
                            </Link>
                            <div>
                              <div className="flex items-center gap-2">
                                <Link to={`/profile`} className="font-bold text-white text-sm hover:text-[#2f9e44] leading-snug">
                                  {post.authorRef?.name || 'Community Member'}
                                </Link>
                                <RoleBadge role={post.authorRef?.role} />
                              </div>
                              <p className="text-[10px] text-gray-400">
                                {post.authorRef?.teamName || 'Technical'} • {new Date(post.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#18202c] text-[#2f9e44] border border-[#2f9e44]/30">
                              {post.postType}
                            </span>
                            <ContentActionMenu
                              targetType="post"
                              targetId={post._id}
                              isOwner={post.authorRef?._id === currentMemberId}
                              isBookmarked={post.isBookmarked}
                              onBookmark={() => handleBookmark(post._id)}
                              onDelete={() => handleDeleteOwnPost(post._id)}
                              onReport={() => setReportingTarget({ targetType: 'post', targetId: post._id })}
                              onCopyLink={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/community/post/${post._id}`);
                                showToast('Post link copied to clipboard!');
                              }}
                            />
                          </div>
                        </div>

                        {/* Content Title & Body */}
                        <div className="space-y-1.5">
                          {post.title && (
                            <Link to={`/community/post/${post._id}`} className="text-base font-bold text-white hover:text-[#2f9e44] transition-colors leading-snug block">
                              {post.title}
                            </Link>
                          )}
                          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line line-clamp-4">
                            {post.content}
                          </p>
                        </div>

                        {/* External Link Option */}
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

                        {/* Image Attachment Presentation */}
                        {imageMedia.length > 0 && (
                          <div className="space-y-3">
                            {imageMedia.map((img, idx) => (
                              <div key={idx} className="rounded-xl overflow-hidden max-h-96 border border-[#30363d] bg-black/40">
                                <img src={img.url} alt={img.fileName || 'Attachment'} className="w-full h-full object-cover max-h-96" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* PDF Attachment Presentation */}
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
                                      PDF Document • {pdf.size ? `${(pdf.size / (1024 * 1024)).toFixed(2)} MB` : 'Note PDF'}
                                    </p>
                                  </div>
                                </div>

                                <a
                                  href={pdf.url}
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
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions Footer */}
                        <div className="pt-3 border-t border-[#30363d] flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-5">
                            <button
                              onClick={() => handleLike(post._id)}
                              className={`flex items-center gap-1.5 font-bold transition-colors ${
                                post.isLiked ? 'text-red-400' : 'hover:text-red-400'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${post.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                              <span>{post.likesCount || 0}</span>
                            </button>

                            <button
                              onClick={() => handleOpenComments(post._id)}
                              className="flex items-center gap-1.5 hover:text-white transition-colors font-medium"
                            >
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span>{post.commentsCount || 0} Comments</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleBookmark(post._id)}
                              className={`flex items-center gap-1.5 font-bold transition-colors ${
                                post.isBookmarked ? 'text-[#2f9e44]' : 'hover:text-[#2f9e44]'
                              }`}
                            >
                              <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'text-[#2f9e44] fill-[#2f9e44]' : 'text-gray-400'}`} />
                              <span>{post.bookmarksCount || 0}</span>
                            </button>

                            <button onClick={() => handleShare(post)} className="flex items-center gap-1.5 hover:text-white transition-colors font-medium">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Threaded 2-Level Discussion Drawer */}
                        {activeCommentPostId === post._id && (
                          <div className="pt-4 border-t border-[#30363d] space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-[#2f9e44]" /> Threaded Discussion
                              </h4>
                              <Link to={`/community/post/${post._id}`} className="text-[10px] text-[#2f9e44] hover:underline font-bold">
                                Full Post Page →
                              </Link>
                            </div>

                            {/* Add Top Comment Form */}
                            <form onSubmit={(e) => handleAddComment(e, null)} className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                className="flex-1 bg-[#0a0d12] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                              />
                              <button type="submit" className="px-4 py-2 rounded-xl gradient-button text-xs font-bold flex items-center gap-1">
                                <Send className="w-3 h-3" />
                              </button>
                            </form>

                            {/* 2-Level Comment Stream */}
                            <div className="space-y-3 pt-1">
                              {postComments.map((c) => {
                                const canDeleteComment = c.authorRef?._id === currentMemberId || post.authorRef?._id === currentMemberId;

                                return (
                                  <div key={c._id} className="p-3 rounded-xl bg-[#0a0d12] border border-[#30363d] text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={c.authorRef?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                                          alt={c.authorRef?.name || 'Member'}
                                          className="w-6 h-6 rounded-full object-cover border border-[#2f9e44]"
                                        />
                                        <span className="font-bold text-white">{c.authorRef?.name || 'Member'}</span>
                                        <RoleBadge role={c.authorRef?.role} />
                                        <span className="text-[9px] text-gray-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => setActiveReplyToId(activeReplyToId === c._id ? null : c._id)}
                                          className="text-[10px] text-[#2f9e44] hover:underline font-bold px-2 py-0.5 rounded bg-[#2f9e44]/10 border border-[#2f9e44]/30"
                                        >
                                          Reply
                                        </button>
                                        <ContentActionMenu
                                          targetType="comment"
                                          targetId={c._id}
                                          isOwner={canDeleteComment}
                                          onDelete={() => handleDeleteComment(c._id)}
                                          onReport={() => setReportingTarget({ targetType: 'comment', targetId: c._id })}
                                        />
                                      </div>
                                    </div>

                                  <p className="text-gray-300 pl-8">{c.content}</p>

                                  {/* Inline Reply Input */}
                                  {activeReplyToId === c._id && (
                                    <form onSubmit={(e) => handleAddComment(e, c._id)} className="flex gap-2 pl-8 pt-1">
                                      <input
                                        type="text"
                                        placeholder={`Reply to ${c.authorRef?.name || 'member'}...`}
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        className="flex-1 bg-[#121721] border border-[#30363d] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                                      />
                                      <button type="submit" className="px-3 py-1 rounded-lg gradient-button text-xs font-bold">
                                        Reply
                                      </button>
                                    </form>
                                  )}

                                  {/* Level-2 Nested Replies */}
                                  {c.replies && c.replies.length > 0 && (
                                    <div className="pl-8 pt-2 space-y-2 border-l border-[#2f9e44]/30">
                                      {c.replies.map((reply) => (
                                        <div key={reply._id} className="p-2 rounded-lg bg-[#121721] border border-[#30363d]/50 space-y-1">
                                          <div className="flex items-center gap-2">
                                            <img
                                              src={reply.authorRef?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                                              alt={reply.authorRef?.name || 'Member'}
                                              className="w-5 h-5 rounded-full object-cover border border-[#2f9e44]"
                                            />
                                            <span className="font-bold text-white text-[11px]">{reply.authorRef?.name || 'Member'}</span>
                                            <span className="text-[9px] text-gray-500">{new Date(reply.createdAt).toLocaleTimeString()}</span>
                                          </div>
                                          <p className="text-[11px] text-gray-300 pl-7">{reply.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </TechCard>

                      {/* Native Feed Banner Insertion after post #4 */}
                      {index === 3 && (
                        <InCampusPromo variant="feed" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

          </section>

          {/* ─── RIGHT SIDEBAR (DESKTOP TRENDING & COMMUNITY) ────────────────── */}
          <aside className="lg:col-span-3 hidden lg:block space-y-6 sticky top-24 max-h-[calc(100vh-6.5rem)] overflow-y-auto pr-1">
            
            {/* Trending Topics */}
            <div className="p-4 rounded-2xl bg-[#121721] border border-[#30363d] space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider block border-b border-[#30363d]/60 pb-2">
                03 // TRENDING TOPICS
              </span>

              <div className="space-y-2">
                {trendingTopics.map((topic) => (
                  <button
                    key={topic.tag}
                    onClick={() => setSelectedTag(topic.tag)}
                    className="w-full p-2 rounded-xl bg-[#0a0d12] border border-[#30363d] hover:border-[#2f9e44]/50 flex items-center justify-between text-left transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#2f9e44] transition-colors">{topic.tag}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{topic.count}</p>
                    </div>
                    <TrendingUp className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#2f9e44]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Active Community Members */}
            <div className="p-4 rounded-2xl bg-[#121721] border border-[#30363d] space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider block border-b border-[#30363d]/60 pb-2">
                04 // ACTIVE MEMBERS
              </span>

              <div className="space-y-2.5">
                {activeMembers.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#18202c]">
                    <img src={m.photo} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-[#2f9e44]" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{m.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Event Card */}
            <TechCard className="p-4 bg-gradient-to-br from-[#121721] to-[#142e16]/40 border-[#2f9e44]/40 space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider block">
                05 // FEATURED EVENT
              </span>
              <h4 className="text-xs font-bold text-white leading-snug">GFG Annual Campus Hackathon 2026</h4>
              <p className="text-[10px] text-gray-300">Registration open for 36-hour competitive coding & web dev sprint.</p>
              <Link to="/events" className="w-full py-2 rounded-xl gradient-button text-xs font-bold text-center block">
                View Event Details
              </Link>
            </TechCard>

            {/* InCampus Compact Sidebar Card */}
            <InCampusPromo variant="sidebar" />

          </aside>

        </div>
      </main>

      {/* ─── CREATE POST COMPOSER MODAL (INSTANT LOCAL PREVIEW & BG UPLOAD) ──── */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider block">
                  CREATE POST
                </span>
                <h3 className="text-lg font-bold text-white">Share with Community</h3>
              </div>
              <button onClick={() => setIsComposerOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4 text-xs">
              
              {/* Category Picker */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Post Category</label>
                <select
                  value={postType}
                  onChange={e => setPostType(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#2f9e44]"
                >
                  <option value="Thought">📝 Thought / Note</option>
                  <option value="Study Note">📚 Study Note / PDF Material</option>
                  <option value="Question">❓ Question / Help Needed</option>
                  <option value="Project">💻 Project Showcase</option>
                  <option value="Achievement">🎉 Achievement / Milestone</option>
                  <option value="Opportunity">💼 Placement / Internship Opportunity</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Title (Optional)</label>
                <input
                  type="text"
                  placeholder="Headline title for your post..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              {/* Body Content */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Post Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your thoughts, study notes, question context, or project breakdown..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              {/* Native File Upload Buttons */}
              <div className="space-y-2">
                <label className="block text-gray-300 font-semibold">Media Attachment (Photo or PDF)</label>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFileType('image');
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = 'image/*';
                        fileInputRef.current.click();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#21262d] text-gray-200 border border-[#30363d] flex items-center gap-2 font-semibold hover:border-[#2f9e44]"
                  >
                    <ImageIcon className="w-4 h-4 text-[#2f9e44]" /> Add Photo from Device
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFileType('pdf');
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = 'application/pdf';
                        fileInputRef.current.click();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#21262d] text-gray-200 border border-[#30363d] flex items-center gap-2 font-semibold hover:border-[#06b6d4]"
                  >
                    <FileText className="w-4 h-4 text-[#06b6d4]" /> Attach PDF Note
                  </button>
                </div>

                {/* Instant Local Preview & Upload Progress Indicator */}
                {filePreviewUrl && (
                  <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {fileType === 'pdf' ? (
                          <FileText className="w-6 h-6 text-[#06b6d4] flex-shrink-0" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-[#2f9e44] flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{selectedFile?.name || 'Attached file'}</p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Local Preview'}
                          </p>
                        </div>
                      </div>

                      <button type="button" onClick={handleRemoveMedia} className="text-gray-400 hover:text-red-400 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Preview */}
                    {fileType === 'image' && filePreviewUrl && (
                      <div className="rounded-lg overflow-hidden max-h-40 border border-[#30363d]">
                        <img src={filePreviewUrl} alt="Upload preview" className="w-full h-full object-cover max-h-40" />
                      </div>
                    )}

                    {/* Upload Status Indicator */}
                    {isUploading ? (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-[#2f9e44] font-mono font-bold">
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Cloudinary...
                          </span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <div className="h-full bg-[#2f9e44] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> File ready for publishing
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optional External URL */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">External Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/... or https://..."
                  value={externalUrl}
                  onChange={e => setExternalUrl(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="DSA, WebDev, Placement, AI"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className={`w-full py-3 rounded-xl gradient-button font-bold text-xs shadow-lg flex items-center justify-center gap-2 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isUploading ? 'Uploading Attachment...' : 'Publish Community Post'}</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingTarget && (
        <ReportModal
          targetType={reportingTarget.targetType}
          targetId={reportingTarget.targetId}
          onClose={() => setReportingTarget(null)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}

      <Footer />
    </div>
  );
}
