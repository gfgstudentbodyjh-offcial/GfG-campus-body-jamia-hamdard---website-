import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import MediaPicker from '../../components/admin/MediaPicker';
import api from '../../services/api';
import {
  Plus, Heart, MessageSquare, Bookmark, Share2, Search, Filter, Pin,
  FileText, Image as ImageIcon, Briefcase, HelpCircle, Award, Sparkles, X, Send, Download
} from 'lucide-react';

import TechHeader from '../../components/common/TechHeader';
import TechCard from '../../components/common/TechCard';

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [search, setSearch] = useState('');
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  const categories = [
    { name: 'All', icon: Sparkles },
    { name: 'Thought', icon: FileText },
    { name: 'Study Note', icon: BookIcon },
    { name: 'Achievement', icon: Award },
    { name: 'Question', icon: HelpCircle },
    { name: 'Opportunity', icon: Briefcase }
  ];

  function BookIcon(props) {
    return <FileText {...props} />;
  }

  const popularTags = ['#DSA', '#React', '#Placement', '#OS', '#DBMS', '#Python', '#CP'];

  const [formData, setFormData] = useState({
    postType: 'Thought',
    title: '',
    content: '',
    mediaUrl: '',
    fileUrl: '',
    tags: 'DSA, React'
  });

  useEffect(() => {
    loadPosts();
  }, [typeFilter, selectedTag, search]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts', {
        params: { type: typeFilter, tag: selectedTag, search }
      });
      setPosts(res.data.data || []);
    } catch (err) {
      console.warn(err);
    }
    setLoading(false);
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`, { memberId: 'm_guest' });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likesCount: res.data.likesCount } : p));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/bookmark`, { memberId: 'm_guest' });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, bookmarksCount: res.data.bookmarksCount } : p));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleOpenComments = async (postId) => {
    setActiveCommentPostId(postId);
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data.data || []);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText || !activeCommentPostId) return;

    try {
      const res = await api.post(`/posts/${activeCommentPostId}/comments`, {
        content: newCommentText,
        authorRef: 'm_guest'
      });
      setComments(prev => [...prev, res.data.data]);
      setPosts(prev => prev.map(p => p._id === activeCommentPostId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      setNewCommentText('');
    } catch (err) {
      alert('Failed adding comment');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim().replace('#', '')).filter(Boolean),
      authorRef: 'm_saquib'
    };

    try {
      await api.post('/posts', payload);
      setIsCreatorOpen(false);
      setFormData({ postType: 'Thought', title: '', content: '', mediaUrl: '', fileUrl: '', tags: 'DSA, React' });
      loadPosts();
    } catch (err) {
      alert('Create post failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d12] text-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Banner */}
        <TechHeader
          tag="06 // STUDENT DEVELOPER NETWORK"
          title="Community Feed"
          description="Learn, ask questions, share study notes, celebrate achievements, and explore career opportunities with fellow chapter members."
          count={posts.length}
          countLabel="Feed Posts"
        >
          <button
            onClick={() => setIsCreatorOpen(true)}
            className="px-6 py-3 rounded-xl gradient-button font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-green-900/30"
          >
            <Plus className="w-4 h-4" /> Create Community Post
          </button>
        </TechHeader>

        {/* Filter Toolbar: Categories & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => setTypeFilter(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    typeFilter === cat.name
                      ? 'bg-[#2f9e44] text-white shadow-md shadow-green-900/30'
                      : 'bg-[#161b22] text-gray-400 hover:text-white border border-[#30363d]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search feed, notes, tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#161b22] border border-[#30363d] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2f9e44]"
            />
          </div>

        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-500 font-semibold flex-shrink-0">Popular Tags:</span>
          <button
            onClick={() => setSelectedTag('All')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              selectedTag === 'All' ? 'bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            #All
          </button>
          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                selectedTag === tag ? 'bg-[#2f9e44]/20 text-[#2f9e44] border border-[#2f9e44]/30' : 'bg-[#161b22] text-gray-400 hover:text-white border border-[#30363d]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Feed Cards Stream */}
        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading Community Feed...</div>
        ) : posts.length === 0 ? (
          <div className="glass-panel p-12 text-center text-gray-500 rounded-3xl border border-[#30363d]">
            <p className="text-base font-bold text-white">No community posts found</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to share a study note, achievement, or question!</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {posts.map((post) => (
              <div key={post._id} className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#30363d] space-y-5 hover:border-[#2f9e44]/40 transition-all relative">
                
                {post.isPinned && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#2f9e44] bg-[#2f9e44]/10 px-3 py-1 rounded-full border border-[#2f9e44]/30 w-fit">
                    <Pin className="w-3 h-3 fill-[#2f9e44]" /> Pinned Announcement
                  </div>
                )}

                {/* Author Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorRef?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                      alt={post.authorRef?.name}
                      className="w-11 h-11 rounded-full object-cover border border-[#2f9e44]"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{post.authorRef?.name || 'Community Member'}</h4>
                      <p className="text-[10px] text-gray-400">{post.authorRef?.role || 'Contributor'} • {new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#21262d] text-gray-200 border border-[#30363d]">
                    {post.postType}
                  </span>
                </div>

                {/* Content Copy */}
                <div className="space-y-2">
                  {post.title && <h3 className="text-lg font-bold text-white">{post.title}</h3>}
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{post.content}</p>
                </div>

                {/* Media or Attachment */}
                {post.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden max-h-96 border border-[#30363d]">
                    <img src={post.mediaUrl} alt="Post attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {post.fileUrl && (
                  <div className="p-4 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-[#2f9e44]" />
                      <div>
                        <p className="text-xs font-bold text-white">Attachment Material / Notes PDF</p>
                        <p className="text-[10px] text-gray-400">Click to view & download study note</p>
                      </div>
                    </div>
                    <a
                      href={post.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#21262d] text-white hover:bg-[#30363d] text-xs font-semibold border border-[#30363d] flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#2f9e44]" /> View PDF
                    </a>
                  </div>
                )}

                {/* Post Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-semibold text-[#2f9e44] bg-[#2f9e44]/10 px-2.5 py-0.5 rounded-md border border-[#2f9e44]/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Feed Actions Footer */}
                <div className="pt-4 border-t border-[#30363d] flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center gap-1.5 hover:text-red-400 transition-colors font-medium"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500/20 hover:fill-red-500" />
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
                      className="flex items-center gap-1.5 hover:text-[#2f9e44] transition-colors font-medium"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>{post.bookmarksCount || 0} Saved</span>
                    </button>
                  </div>
                </div>

                {/* Threaded Comments Drawer */}
                {activeCommentPostId === post._id && (
                  <div className="pt-4 border-t border-[#30363d] space-y-4">
                    <h5 className="font-bold text-white text-xs">Threaded Discussion</h5>
                    
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a reply or thought..."
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                      />
                      <button type="submit" className="px-4 py-2 rounded-xl gradient-button text-xs font-bold flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" /> Post
                      </button>
                    </form>

                    <div className="space-y-3 pt-2">
                      {comments.map((c) => (
                        <div key={c._id} className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{c.authorRef?.name || 'Member'}</span>
                            <span className="text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-gray-300">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </main>

      {/* Create Post Modal */}
      {isCreatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#30363d] pb-4">
              <h3 className="text-lg font-bold text-white">Create Knowledge Post</h3>
              <button onClick={() => setIsCreatorOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Select Post Category</label>
                <select
                  value={formData.postType}
                  onChange={e => setFormData({ ...formData, postType: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                >
                  <option value="Thought">📝 Thought</option>
                  <option value="Study Note">📚 Study Note</option>
                  <option value="Image">📷 Image</option>
                  <option value="Achievement">🎉 Achievement</option>
                  <option value="Question">❓ Question</option>
                  <option value="Opportunity">💼 Opportunity</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Post Headline Title</label>
                <input
                  type="text"
                  placeholder="e.g. Operating System Scheduling Notes"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Post Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your thought, solution explanation, or note details..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Image Attachment URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.mediaUrl}
                    onChange={e => setFormData({ ...formData, mediaUrl: e.target.value })}
                    className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-3 py-2 rounded-lg bg-[#21262d] text-gray-200 border border-[#30363d] flex items-center gap-1 font-semibold"
                  >
                    <ImageIcon className="w-4 h-4 text-[#2f9e44]" /> Pick Media
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">File / PDF Note Link</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.fileUrl}
                  onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="DSA, React, OS, DBMS"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#2f9e44]"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-xl gradient-button font-bold text-sm">
                Publish Community Post
              </button>
            </form>
          </div>
        </div>
      )}

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={(url) => setFormData(prev => ({ ...prev, mediaUrl: url }))}
        currentFolder="General"
      />

      <Footer />
    </div>
  );
}
