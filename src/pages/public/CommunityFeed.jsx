import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import {
  Sparkles, FileText, Award, HelpCircle, Briefcase, Code2, Search, Plus,
  Heart, MessageSquare, Bookmark, Share2, Pin, X, Send, Download, ExternalLink,
  ShieldCheck, Upload, Trash2, Calendar, Users, TrendingUp, Compass, BookmarkCheck,
  CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Crop
} from 'lucide-react';
import ImageCropModal from '../../components/common/ImageCropModal';
import TechCard from '../../components/common/TechCard';
import InCampusPromo from '../../components/common/InCampusPromo';
import RoleBadge from '../../components/common/RoleBadge';
import ContentActionMenu from '../../components/common/ContentActionMenu';
import ReportModal from '../../components/common/ReportModal';
import PostCard from '../../components/community/PostCard';
import CommentSection from '../../components/community/CommentSection';
import AuthorIdentity from '../../components/common/AuthorIdentity';
import { isValidMediaUrl, resolveAvatarUrl } from '../../utils/mediaResolver';
import { getCachedFeed, setCachedFeed, patchCachedPost, removeCachedPost } from '../../utils/communityCache';
import cacheService from '../../services/cacheService';

import { useAuth } from '../../context/AuthContext';

export default function CommunityFeed() {
  const navigate = useNavigate();
  const { user, member: authMember, isAuthenticated, openAuthModal, requireAuthAction } = useAuth();
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

  // Friendly Tag & Link State for Child-Easy Composer
  const [selectedTopics, setSelectedTopics] = useState(['DSA', 'WebDevelopment']);
  const [customTagText, setCustomTagText] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(prev => prev.filter(t => t !== topic));
    } else {
      setSelectedTopics(prev => [...prev, topic]);
    }
  };

  const handleAddCustomTopic = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = customTagText.trim().replace(/^#/, '').replace(/,$/, '');
      if (val && !selectedTopics.includes(val)) {
        setSelectedTopics(prev => [...prev, val]);
      }
      setCustomTagText('');
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isComposerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isComposerOpen]);

  // Optional Community Post Crop State & Lightbox State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSource, setCropSource] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const fileInputRef = useRef(null);
  const searchTimerRef = useRef(null);

  // Threaded Discussion Drawer State per Post
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeReplyToId, setActiveReplyToId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Logged-in member identity
  const currentMemberId = authMember?._id || user?.id || 'm_saquib';

  // Toast, Delete Post, Publishing & Report State
  const [isPublishing, setIsPublishing] = useState(false);
  const isPublishingRef = useRef(false);

  const [toastMessage, setToastMessage] = useState('');
  const [reportingTarget, setReportingTarget] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const handleDeleteOwnPost = (postId) => {
    const targetPost = posts.find(p => p._id === postId);
    if (targetPost) {
      setPostToDelete(targetPost);
    }
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeletingPost(true);
    try {
      const res = await api.delete(`/posts/${postToDelete._id}`);
      if (res.data?.success) {
        setPosts(prev => prev.filter(p => p._id !== postToDelete._id));
        showToast('Post deleted permanently.');
      } else {
        alert(res.data?.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Delete post error:', err);
      alert(err.response?.data?.message || 'Failed to delete post.');
    } finally {
      setIsDeletingPost(false);
      setPostToDelete(null);
    }
  };

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

  const [activeMembers, setActiveMembers] = useState([]);
  const [loadingActiveMembers, setLoadingActiveMembers] = useState(true);

  useEffect(() => {
    const cachedActive = cacheService.get('active_members_7d', 45000);
    if (cachedActive && cachedActive.data) {
      setActiveMembers(cachedActive.data);
      setLoadingActiveMembers(false);
    }

    cacheService.dedupe('active_members_7d', () => api.get('/members/active'))
      .then(res => {
        const raw = res.data?.members || res.data?.data || res.data;
        const data = Array.isArray(raw) ? raw : [];
        setActiveMembers(data);
        cacheService.set('active_members_7d', data);
      })
      .catch(err => {
        console.error('[Active Members Error]:', err.message);
        setActiveMembers([]);
      })
      .finally(() => setLoadingActiveMembers(false));
  }, []);

  // Synchronized Filter Handler (Left Sidebar Nav)
  const handleNavClick = (navName) => {
    if ((navName === 'Saved' || navName === 'My Posts') && !isAuthenticated) {
      requireAuthAction(null, `view ${navName.toLowerCase()}`);
      return;
    }

    setActiveNav(navName);

    // Synchronize top category chip if matching
    if (navName === 'For You' || navName === 'Latest') {
      setTypeFilter('All');
    } else if (navName === 'Study Notes') {
      setTypeFilter('Study Note');
    } else if (navName === 'Questions') {
      setTypeFilter('Question');
    } else if (navName === 'Projects') {
      setTypeFilter('Project');
    } else if (navName === 'Achievements') {
      setTypeFilter('Achievement');
    }
  };

  // Synchronized Filter Handler (Top Category Chips)
  const handleCategoryChipClick = (catName) => {
    setTypeFilter(catName);
    if (catName === 'All') {
      if (activeNav !== 'Latest') setActiveNav('For You');
    } else if (catName === 'Study Note') {
      setActiveNav('Study Notes');
    } else if (catName === 'Question') {
      setActiveNav('Questions');
    } else if (catName === 'Project') {
      setActiveNav('Projects');
    } else if (catName === 'Achievement') {
      setActiveNav('Achievements');
    }
  };

  // Hashtag Toggle & Undo Handler (#All clears tag filter)
  const handleTagClick = (tag) => {
    if (tag === '#All' || tag === 'All' || selectedTag === tag) {
      setSelectedTag('');
    } else {
      setSelectedTag(tag);
    }
  };

  // Save scroll position when navigating away or unmounting
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('community_feed_scroll', String(window.scrollY));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position after posts are rendered from cache or network
  useEffect(() => {
    if (!loading && posts.length > 0) {
      const savedY = sessionStorage.getItem('community_feed_scroll');
      if (savedY) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: parseInt(savedY, 10), behavior: 'instant' });
        });
      }
    }
  }, [loading]);

  useEffect(() => {
    // Search debouncing 350ms
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      loadPosts();
    }, search ? 350 : 0);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [activeNav, typeFilter, selectedTag, search]);

  const loadPosts = async () => {
    const cacheKey = `${activeNav}_${typeFilter}_${selectedTag}_${search}`;
    const cached = getCachedFeed(cacheKey);

    if (cached && cached.length > 0) {
      setPosts(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await cacheService.dedupe(`feed:${cacheKey}`, () => api.get('/posts', {
        params: {
          filter: activeNav,
          type: typeFilter,
          tag: selectedTag,
          search
        }
      }));
      const fetchedPosts = res.data.data || [];
      setPosts(fetchedPosts);
      setCachedFeed(cacheKey, fetchedPosts);
    } catch (err) {
      console.warn('Failed loading feed posts:', err);
    } finally {
      setLoading(false);
    }
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
      const endpoint = detectedType === 'pdf' ? '/media/upload-pdf' : '/media/upload';
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress(100);

      // Cloudinary source of truth: extract from normalized media field first
      const cloudUrl = res.data?.media?.url || res.data?.data?.url || res.data?.url;
      const cloudPublicId = res.data?.media?.publicId || res.data?.data?.publicId || '';

      const isValidUrl = cloudUrl && (cloudUrl.startsWith('http') || cloudUrl.startsWith('/uploads/') || cloudUrl.startsWith('/api/'));

      if (isValidUrl) {
        URL.revokeObjectURL(localUrl);
        setFilePreviewUrl(cloudUrl);
        setUploadedMedia({
          type: detectedType,
          url: cloudUrl,
          publicId: cloudPublicId,
          fileName: file.name,
          size: file.size
        });
      } else {
        throw new Error('Upload completed but returned an unresolvable URL: ' + String(cloudUrl));
      }
    } catch (err) {
      console.error('Media upload error:', err);
      showToast('Media upload failed. Local preview retained for posting.');
      // Keep local preview URL so the user can still post with the attached file!
      setUploadedMedia({
        type: detectedType,
        url: localUrl,
        publicId: `local_${Date.now()}`,
        fileName: file.name,
        size: file.size
      });
    } finally {
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

  const handleOpenAdjustPostCrop = () => {
    const src = filePreviewUrl || selectedFile;
    if (!src) return;
    setCropSource(src);
    setCropModalOpen(true);
  };

  const handleApplyCroppedPostImage = async ({ croppedFile }) => {
    if (!croppedFile) return;

    setIsUploading(true);
    setUploadProgress(30);

    const formData = new FormData();
    formData.append('mediaFile', croppedFile);
    formData.append('folder', 'Posts');

    try {
      setUploadProgress(70);
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadProgress(100);

      const cloudUrl = res.data?.media?.url || res.data?.data?.url || res.data?.url;
      const cloudPublicId = res.data?.media?.publicId || res.data?.data?.publicId || '';

      if (cloudUrl && cloudUrl.startsWith('http')) {
        setFilePreviewUrl(cloudUrl);
        setUploadedMedia({
          type: 'image',
          url: cloudUrl,
          publicId: cloudPublicId,
          fileName: croppedFile.name,
          size: croppedFile.size
        });
        showToast('Image framing updated!');
      }
    } catch (err) {
      console.error('Cropped post media upload error:', err);
      showToast('Could not update image framing.');
    } finally {
      setIsUploading(false);
    }
  };

  const postClientIdRef = useRef(null);
  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!requireAuthAction(null, 'create a community post')) return;
    const contentWords = content.trim().split(/\s+/).filter(Boolean).length;
    if (contentWords > 500) {
      alert('Post content cannot exceed 500 words.');
      return;
    }
    if (title && title.length > 120) {
      alert('Title cannot exceed 120 characters.');
      return;
    }

    isPublishingRef.current = true;
    setIsPublishing(true);

    if (!postClientIdRef.current) {
      postClientIdRef.current = 'req_post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    try {
      const mediaList = uploadedMedia ? [uploadedMedia] : [];
      const parsedTags = Array.from(new Set([
        ...selectedTopics,
        ...tagsInput.split(',').map(t => t.trim().replace('#', '')).filter(Boolean)
      ]));

      const payload = {
        postType,
        title: title || (postType === 'Thought' ? '' : 'Discussion Note'),
        content,
        media: mediaList,
        externalUrl,
        tags: parsedTags,
        clientRequestId: postClientIdRef.current
      };

      const res = await api.post('/posts', payload);
      const newPost = res.data.data;

      setPosts(prev => [newPost, ...prev]);
      setIsComposerOpen(false);
      
      // Reset form
      setTitle('');
      setContent('');
      setExternalUrl('');
      setShowLinkInput(false);
      setSelectedTopics(['DSA', 'WebDevelopment']);
      setCustomTagText('');
      setTagsInput('DSA, WebDev');
      handleRemoveMedia();
      postClientIdRef.current = null;
      showToast('Community post published!');
    } catch (err) {
      alert('Failed creating post: ' + (err.response?.data?.message || err.message));
    } finally {
      isPublishingRef.current = false;
      setIsPublishing(false);
    }
  };

  const pendingLikesRef = useRef(new Set());
  const pendingBookmarksRef = useRef(new Set());

  const handleLike = async (postId) => {
    if (!requireAuthAction(null, 'like posts')) return;
    if (pendingLikesRef.current.has(postId)) return;
    pendingLikesRef.current.add(postId);

    let prevState = null;
    let nextLiked = false;
    let nextCount = 0;

    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        prevState = { isLiked: p.isLiked, likesCount: p.likesCount };
        nextLiked = !p.isLiked;
        nextCount = nextLiked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 1) - 1);
        return { ...p, isLiked: nextLiked, likesCount: nextCount };
      }
      return p;
    }));

    // Synchronize cache immediately for instant persistence across routes
    patchCachedPost(postId, (p) => ({ ...p, likesCount: nextCount, isLiked: nextLiked }));

    try {
      const res = await api.post(`/posts/${postId}/like`);
      if (res.data?.success || res.data?.isLiked !== undefined) {
        const serverCount = res.data.likesCount !== undefined ? res.data.likesCount : nextCount;
        const serverLiked = res.data.isLiked !== undefined ? res.data.isLiked : nextLiked;
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likesCount: serverCount, isLiked: serverLiked } : p));
        patchCachedPost(postId, (p) => ({ ...p, likesCount: serverCount, isLiked: serverLiked }));
      }
    } catch (err) {
      console.warn('Like toggle failed:', err);
      if (prevState) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, ...prevState } : p));
        patchCachedPost(postId, (p) => ({ ...p, ...prevState }));
        showToast("Couldn't update like.");
      }
    } finally {
      pendingLikesRef.current.delete(postId);
    }
  };

  const handleBookmark = async (postId) => {
    if (!requireAuthAction(null, 'save posts')) return;
    if (pendingBookmarksRef.current.has(postId)) return;
    pendingBookmarksRef.current.add(postId);

    let prevState = null;
    let nextBookmarked = false;
    let nextCount = 0;

    setPosts(prev => prev.map(p => {
      if (p._id === postId) {
        prevState = { isBookmarked: p.isBookmarked, bookmarksCount: p.bookmarksCount };
        nextBookmarked = !p.isBookmarked;
        nextCount = nextBookmarked ? (p.bookmarksCount || 0) + 1 : Math.max(0, (p.bookmarksCount || 1) - 1);
        return { ...p, isBookmarked: nextBookmarked, bookmarksCount: nextCount };
      }
      return p;
    }));

    // Synchronize cache immediately for instant persistence across routes
    patchCachedPost(postId, (p) => ({ ...p, bookmarksCount: nextCount, isBookmarked: nextBookmarked }));

    try {
      const res = await api.post(`/posts/${postId}/bookmark`);
      if (res.data?.success || res.data?.isBookmarked !== undefined) {
        const serverCount = res.data.bookmarksCount !== undefined ? res.data.bookmarksCount : nextCount;
        const serverBookmarked = res.data.isBookmarked !== undefined ? res.data.isBookmarked : nextBookmarked;
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, bookmarksCount: serverCount, isBookmarked: serverBookmarked } : p));
        patchCachedPost(postId, (p) => ({ ...p, bookmarksCount: serverCount, isBookmarked: serverBookmarked }));
        showToast(serverBookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks');
      }
    } catch (err) {
      console.warn('Bookmark toggle failed:', err);
      if (prevState) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, ...prevState } : p));
        patchCachedPost(postId, (p) => ({ ...p, ...prevState }));
        showToast("Couldn't save post.");
      }
    } finally {
      pendingBookmarksRef.current.delete(postId);
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
    setLoadingComments(true);
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setPostComments(res.data.data || []);
    } catch (err) {
      console.warn('Error fetching post comments:', err);
      setPostComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (text, parentCommentId = null) => {
    if (!requireAuthAction(null, 'join the discussion')) return;

    if (!text || typeof text !== 'string' || !text.trim() || !activeCommentPostId || commentSubmittingRef.current) return;

    commentSubmittingRef.current = true;
    const clientRequestId = 'req_cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

    try {
      const res = await api.post(`/posts/${activeCommentPostId}/comments`, {
        content: text.trim(),
        parentCommentId,
        clientRequestId
      });

      const newComment = res.data.data;

      if (parentCommentId) {
        setPostComments(prev => prev.map(c => {
          if (c._id === parentCommentId) {
            return { ...c, replies: [...(c.replies || []), newComment] };
          }
          return c;
        }));
      } else {
        setPostComments(prev => [...prev, newComment]);
      }

      setPosts(prev => prev.map(p => p._id === activeCommentPostId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      patchCachedPost(activeCommentPostId, (p) => ({ ...p, commentsCount: (p.commentsCount || 0) + 1 }));
      showToast('Comment added');
    } catch (err) {
      alert('Failed adding comment: ' + (err.response?.data?.message || err.message));
    } finally {
      commentSubmittingRef.current = false;
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!requireAuthAction(null, 'delete comments')) return;
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
                COMMUNITY FEED
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
                    onClick={() => handleNavClick(item.name)}
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
                DISCOVER
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
          <section className="lg:col-span-6 w-full max-w-[740px] mx-auto space-y-4 sm:space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#30363d] gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-[#2f9e44] uppercase tracking-wider font-bold block truncate">
                  COMMUNITY NETWORK
                </span>
                <h1 className="text-lg sm:text-2xl font-extrabold text-white truncate">Community Feed</h1>
              </div>

              <button
                onClick={() => setIsComposerOpen(true)}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl gradient-button text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#2f9e44]/25 flex-shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">+ Create Post</span>
                <span className="sm:hidden">+ Post</span>
              </button>
            </div>

            {/* Inline Quick Post Box */}
            <TechCard className="p-4 bg-[#121721] border-[#30363d] space-y-3">
              <div
                onClick={() => setIsComposerOpen(true)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img
                  src={resolveAvatarUrl(authMember?.photo || user?.photo, authMember?.name || user?.username || 'You')}
                  alt="Your avatar"
                  className="w-9 h-9 rounded-full object-cover border border-[#2f9e44] flex-shrink-0"
                />
                <div className="flex-1 bg-[#0a0d12] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-xs text-gray-400 truncate">
                  Share something with the community...
                </div>
              </div>
            </TechCard>

            {/* Category Filter Pills & Search */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-proximity pb-1 pr-4 max-w-full">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = typeFilter === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => handleCategoryChipClick(cat.name)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 flex-none snap-start ${
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

              {/* Search Bar (100% width) */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts, topics, or notes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#121721] border border-[#30363d] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2f9e44]"
                />
              </div>
            </div>

            {/* Active Tag Filters Horizontal Rail */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pb-1 pr-4 max-w-full">
              <span className="text-gray-500 font-mono font-bold flex-none">TAGS:</span>
              {popularTags.map(tag => {
                const isAll = tag === '#All' || tag === 'All';
                const isSelected = isAll ? !selectedTag : selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex-none transition-all touch-manipulation focus:outline-none ${
                      isSelected
                        ? 'bg-[#2f9e44] text-white shadow-md border border-[#2f9e44]'
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
              <div className="py-16 text-center space-y-3 bg-[#121721] rounded-2xl border border-[#30363d] p-8">
                <Sparkles className="w-8 h-8 text-gray-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No community posts found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Be the first to start a conversation, share notes, or post a project update!
                </p>
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="px-5 py-2.5 rounded-xl gradient-button text-xs font-bold inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Share Community Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, index) => {
                  const showPromoAfterThis = (posts.length >= 3 && index === 2) || (posts.length < 3 && index === posts.length - 1);
                  return (
                    <React.Fragment key={post._id}>
                      <div className="space-y-3">
                        <PostCard
                          post={post}
                          currentMemberId={currentMemberId}
                          user={user}
                          onLike={handleLike}
                          onBookmark={handleBookmark}
                          onDelete={handleDeleteOwnPost}
                          onReport={(p) => setReportingTarget({ targetType: 'post', targetId: p._id })}
                          onOpenComments={handleOpenComments}
                          onShare={handleShare}
                          onImageClick={(url) => setLightboxUrl(url)}
                        />

                        {activeCommentPostId === post._id && (
                          <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] shadow-2xl animate-fade-in">
                            <CommentSection
                              postId={post._id}
                              comments={postComments}
                              loading={loadingComments}
                              currentMemberId={currentMemberId}
                              postAuthorId={post.authorRef?._id}
                              onAddComment={(text, parentCommentId) => handleAddComment(text, parentCommentId)}
                              onDeleteComment={handleDeleteComment}
                              onReportComment={(cmt) => setReportingTarget({ targetType: 'comment', targetId: cmt._id })}
                            />
                          </div>
                        )}
                      </div>

                      {showPromoAfterThis && (
                        <InCampusPromo variant="feed" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

          </section>

          {/* ─── RIGHT SIDEBAR (TRENDING & REAL ACTIVE MEMBERS) ──────────── */}
          <aside className="lg:col-span-3 hidden lg:block space-y-6 sticky top-24 max-h-[calc(100vh-6.5rem)] overflow-y-auto pl-1">
            
            {/* Trending Tags Card */}
            <div className="p-4 rounded-2xl bg-[#121721] border border-[#30363d] space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider block border-b border-[#30363d]/60 pb-2">
                TRENDING TOPICS
              </span>

              <div className="space-y-1.5">
                {trendingTopics.map((topic) => (
                  <button
                    key={topic.tag}
                    onClick={() => handleTagClick(topic.tag)}
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

            {/* Active Community Members (Real MongoDB Data - Last 7 Days) */}
            <div className="p-4 rounded-2xl bg-[#121721] border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363d]/60 pb-2">
                <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider block">
                  ACTIVE MEMBERS
                </span>
                <span className="text-[9px] font-mono text-gray-500">Last 7 Days</span>
              </div>

              {loadingActiveMembers ? (
                <div className="py-4 text-center text-xs font-mono text-gray-500">Loading active members...</div>
              ) : activeMembers.length === 0 ? (
                <div className="py-3 text-center text-xs font-mono text-gray-500 bg-[#0a0d12] rounded-xl p-3 border border-[#30363d]/40">
                  No recent community activity yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeMembers.map((m) => (
                    <div key={m._id || m.username} className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#18202c] transition-colors">
                      <AuthorIdentity member={m} size="small" showTeam={false} className="min-w-0 flex-1" />
                      {m.activityScore > 0 && (
                        <span className="text-[10px] font-mono text-[#2f9e44] font-bold ml-1 flex-shrink-0">
                          {m.activityScore} pts
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Event Card */}
            <TechCard className="p-4 bg-gradient-to-br from-[#121721] to-[#142e16]/40 border-[#2f9e44]/40 space-y-3">
              <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase tracking-wider block">
                FEATURED EVENT
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

      {/* ─── CREATE POST COMPOSER MODAL (CHILD-EASY & FRIENDLY UX) ──── */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md transition-all">
          <div className="bg-[#121721] border border-[#30363d] rounded-t-3xl sm:rounded-2xl w-full max-w-xl max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Modal Header with User Identity Bar */}
            <div className="p-4 sm:p-5 border-b border-[#30363d] flex items-center justify-between bg-[#161b22] flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={resolveAvatarUrl(authMember?.photo || user?.photo, authMember?.name || user?.username || 'You')}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full object-cover border border-[#2f9e44] flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {authMember?.name || user?.username || 'Community Member'}
                  </h3>
                  <p className="text-[10px] font-mono text-gray-400 truncate">
                    {authMember?.role || 'Campus Member'} • Share something with community
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-[#18202c] transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreatePostSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs no-scrollbar">
              
              {/* Visual Category Selection Chips (What do you want to share?) */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                  What do you want to share?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { type: 'Thought', icon: '💭', label: 'Thought', desc: 'Share an idea or update' },
                    { type: 'Question', icon: '❓', label: 'Question', desc: 'Ask community for help' },
                    { type: 'Study Note', icon: '📚', label: 'Study Note', desc: 'Share notes or PDF' },
                    { type: 'Project', icon: '💻', label: 'Project', desc: 'Show what you built' },
                    { type: 'Achievement', icon: '🏆', label: 'Achievement', desc: 'Share your milestone' }
                  ].map((item) => {
                    const isSelected = postType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setPostType(item.type)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#2f9e44]/20 border-[#2f9e44] text-white shadow-md shadow-[#2f9e44]/10'
                            : 'bg-[#0a0d12] border-[#30363d] text-gray-400 hover:text-white hover:bg-[#18202c]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight mt-1 truncate">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Title Input based on selected postType */}
              {postType !== 'Thought' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-300">
                      {postType === 'Question'
                        ? 'What do you want to ask? *'
                        : postType === 'Study Note'
                        ? 'What are your notes about? *'
                        : postType === 'Project'
                        ? 'What did you build? *'
                        : 'What did you achieve? *'}
                    </label>
                    <span className={`text-[10px] font-mono ${title.length > 100 ? 'text-amber-400 font-bold' : 'text-gray-500'}`}>
                      {title.length} / 120 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={120}
                    required={postType !== 'Thought'}
                    placeholder={
                      postType === 'Question'
                        ? 'e.g. How does Dijkstra algorithm handle negative weights?'
                        : postType === 'Study Note'
                        ? 'e.g. Binary Trees Revision Notes'
                        : postType === 'Project'
                        ? 'e.g. Portfolio Website / GFG Bot'
                        : 'e.g. Completed 100 Days of Code'
                    }
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#0a0d12] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#2f9e44]"
                  />
                </div>
              )}

              {/* Main Content Body with Live 500-Word Counter */}
              <div>
                {(() => {
                  const words = content.trim().split(/\s+/).filter(Boolean).length;
                  const isWarning = words >= 450 && words < 500;
                  const isLimit = words >= 500;

                  return (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-300">
                          {postType === 'Thought'
                            ? "What's on your mind? *"
                            : postType === 'Question'
                            ? 'Add details *'
                            : postType === 'Study Note'
                            ? 'Add your notes or explanation *'
                            : postType === 'Project'
                            ? 'Tell us about it *'
                            : 'Tell everyone about it *'}
                        </label>
                        <span className={`text-[10px] font-mono font-bold ${
                          isLimit
                            ? 'text-red-400'
                            : isWarning
                            ? 'text-amber-400'
                            : 'text-gray-400'
                        }`}>
                          {isLimit
                            ? `${words} / 500 words — Maximum reached`
                            : `${words} / 500 words`}
                        </span>
                      </div>

                      <textarea
                        rows={4}
                        required
                        placeholder={
                          postType === 'Thought'
                            ? 'Write something...'
                            : postType === 'Question'
                            ? 'Explain your question so others can help...'
                            : postType === 'Study Note'
                            ? 'Write a short explanation or key takeaways...'
                            : postType === 'Project'
                            ? 'What does your project do? What tech stack did you use?'
                            : 'Share your experience, certificate, or learnings...'
                        }
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className={`w-full bg-[#0a0d12] border rounded-xl p-3.5 text-white placeholder-gray-500 focus:outline-none resize-none transition-colors ${
                          isLimit
                            ? 'border-red-500 focus:border-red-500'
                            : isWarning
                            ? 'border-amber-500/60 focus:border-amber-500'
                            : 'border-[#30363d] focus:border-[#2f9e44]'
                        }`}
                      />
                    </>
                  );
                })()}
              </div>

              {/* Media Action Buttons & Previews */}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Add something
                </label>
                
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
                    className="px-3.5 py-2 rounded-xl bg-[#0a0d12] text-gray-200 border border-[#30363d] flex items-center gap-2 font-bold hover:border-[#2f9e44] hover:bg-[#18202c] transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-[#2f9e44]" />
                    <span>Photo</span>
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
                    className="px-3.5 py-2 rounded-xl bg-[#0a0d12] text-gray-200 border border-[#30363d] flex items-center gap-2 font-bold hover:border-[#06b6d4] hover:bg-[#18202c] transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#06b6d4]" />
                    <span>PDF Notes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    className={`px-3.5 py-2 rounded-xl bg-[#0a0d12] text-gray-200 border border-[#30363d] flex items-center gap-2 font-bold hover:border-yellow-400 hover:bg-[#18202c] transition-colors ${
                      showLinkInput || externalUrl ? 'border-yellow-400/60 text-yellow-400' : ''
                    }`}
                  >
                    <ExternalLink className="w-4 h-4 text-yellow-400" />
                    <span>Link</span>
                  </button>
                </div>

                {/* External Link Input Drawer */}
                {(showLinkInput || externalUrl) && (
                  <div className="pt-1 animate-fade-in">
                    <input
                      type="url"
                      placeholder="Paste website, GitHub or project link (https://...)"
                      value={externalUrl}
                      onChange={e => setExternalUrl(e.target.value)}
                      className="w-full bg-[#0a0d12] border border-[#30363d] rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#2f9e44]"
                    />
                  </div>
                )}

                {/* Visual Attachment Preview Card */}
                {filePreviewUrl && (
                  <div className="p-3.5 rounded-xl bg-[#0a0d12] border border-[#30363d] space-y-2 relative animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {fileType === 'pdf' ? (
                          <div className="p-2 rounded-lg bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#06b6d4] flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-[#2f9e44]/15 border border-[#2f9e44]/30 text-[#2f9e44] flex-shrink-0">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate text-xs">{selectedFile?.name || 'Attached document'}</p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {selectedFile ? `${fileType.toUpperCase()} • ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Attached'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {fileType === 'image' && (
                          <button
                            type="button"
                            onClick={handleOpenAdjustPostCrop}
                            className="px-2.5 py-1 rounded-lg bg-[#18202c] hover:bg-[#2f9e44] text-white text-[11px] font-bold border border-[#30363d] flex items-center gap-1 transition-colors"
                          >
                            <Crop className="w-3 h-3" /> Adjust Crop
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveMedia}
                          className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-[#18202c]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Image Preview Window */}
                    {fileType === 'image' && filePreviewUrl && (
                      <div className="relative group rounded-xl overflow-hidden max-h-48 border border-[#30363d] bg-[#0d1117]">
                        <img src={filePreviewUrl} alt="Photo preview" className="w-full h-full object-contain max-h-48" />
                      </div>
                    )}

                    {/* Simple Upload Status Feedback */}
                    {isUploading ? (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-[#2f9e44] font-mono font-bold">
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading {fileType === 'pdf' ? 'PDF' : 'photo'}...
                          </span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#21262d] rounded-full overflow-hidden">
                          <div className="h-full bg-[#2f9e44] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {fileType === 'pdf' ? 'PDF ready ✓' : 'Photo ready ✓'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Topics / Tags Section */}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Add topics
                </label>

                {/* Suggested Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {['DSA', 'WebDevelopment', 'AI', 'Placement', 'Projects', 'Hackathon'].map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                          isSelected
                            ? 'bg-[#2f9e44] text-white shadow-md border border-[#2f9e44]'
                            : 'bg-[#0a0d12] text-gray-400 hover:text-white border border-[#30363d]'
                        }`}
                      >
                        #{topic} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tag Input */}
                <input
                  type="text"
                  placeholder="Type another topic and press Enter..."
                  value={customTagText}
                  onChange={e => setCustomTagText(e.target.value)}
                  onKeyDown={handleAddCustomTopic}
                  className="w-full bg-[#0a0d12] border border-[#30363d] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

            </form>

            {/* Sticky Action Footer inside Modal */}
            <div className="p-4 sm:p-5 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#18202c] hover:bg-[#30363d] text-gray-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                onClick={handleCreatePostSubmit}
                disabled={isUploading || isPublishing || !content.trim() || (postType !== 'Thought' && !title.trim())}
                className={`px-6 py-2.5 rounded-xl gradient-button text-xs font-bold shadow-lg flex items-center gap-2 transition-all ${
                  isUploading || isPublishing || !content.trim() || (postType !== 'Thought' && !title.trim())
                    ? 'opacity-50 cursor-not-allowed pointer-events-none'
                    : ''
                }`}
              >
                {(isUploading || isPublishing) ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
                <span>
                  {isUploading
                    ? `Uploading ${fileType === 'pdf' ? 'PDF' : 'Photo'}...`
                    : isPublishing
                    ? 'Publishing Post...'
                    : 'Publish Post'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Post Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121721] border border-[#30363d] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <Trash2 className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Post Permanently?</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">"{postToDelete.title || 'this post'}"</span>? This will permanently remove the post and its uploaded media. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingPost}
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white bg-[#18202c] hover:bg-[#30363d] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPost}
                onClick={confirmDeletePost}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-red-600/30"
              >
                {isDeletingPost ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
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

      {/* Fullscreen Image Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-3 rounded-full bg-black/60 hover:bg-black text-white text-xs font-bold border border-white/20 transition-all shadow-xl z-50 flex items-center gap-2"
          >
            <X className="w-5 h-5" /> Close Preview
          </button>
          <img
            src={lightboxUrl}
            alt="Enlarged Post View"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-[#30363d] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Image Crop Modal for Community Posts */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropSource}
        presetKey="communityPost"
        title="Adjust Post Photo Framing"
        onClose={() => {
          setCropModalOpen(false);
          setCropSource(null);
        }}
        onApplyCrop={handleApplyCroppedPostImage}
      />

      <Footer />
    </div>
  );
}
