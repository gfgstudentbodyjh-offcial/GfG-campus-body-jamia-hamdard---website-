import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import RoleBadge from '../../components/common/RoleBadge';
import MembershipCard from '../../components/common/MembershipCard';
import TechCard from '../../components/common/TechCard';
import TechHeader from '../../components/common/TechHeader';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import { useAuth } from '../../context/AuthContext';
import { resolveAvatarUrl, isValidMediaUrl, getValidMediaUrl } from '../../utils/mediaResolver';
import {
  User, Edit3, Github, Linkedin, Globe, Instagram, Plus, X,
  Bookmark, MessageSquare, ShieldCheck, Heart, Trash2, CheckCircle2,
  Calendar, Award, Sparkles, ExternalLink, Camera, Upload, AlertCircle,
  KeyRound, Shield, Settings as SettingsIcon
} from 'lucide-react';

export default function ProfilePage() {
  const { memberId: paramMemberId } = useParams();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { user, member: authMember, isAuthenticated, openAuthModal } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [settingsSubTab, setSettingsSubTab] = useState('security'); // 'profile' | 'security'

  // Change Password Modal State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Profile Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    about: '',
    photo: '',
    coverPhoto: '',
    github: '',
    linkedin: '',
    portfolio: '',
    instagram: '',
    website: '',
    skills: [],
    expertise: []
  });
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newExpertiseInput, setNewExpertiseInput] = useState('');

  // Image Upload Refs & Progress State
  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // onError fallback state for rendered images
  const [avatarError, setAvatarError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  // Activity Tabs Data
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const currentMemberId = authMember?._id || user?.id || 'm_saquib';
  const targetId = paramMemberId || currentMemberId;
  const isOwner = !paramMemberId || paramMemberId === currentMemberId;

  const handlePhotoImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setIsUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'Members');
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Cloudinary source of truth: only update state when a real HTTPS URL is returned
      const cloudUrl = res.data?.media?.url || res.data?.data?.url || res.data?.url;
      if (cloudUrl && cloudUrl.startsWith('http')) {
        const publicId = res.data?.media?.publicId || res.data?.data?.publicId || '';
        setEditForm(prev => ({ ...prev, photo: cloudUrl, photoPublicId: publicId }));
        setAvatarError(false);
      } else {
        throw new Error('Upload succeeded but returned an invalid URL.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Avatar upload failed.';
      setUploadError(`Avatar upload failed: ${msg}`);
      console.error('[ProfilePage] Avatar upload error:', err);
      // Preserve existing photo — do not mutate state with blob URL
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleCoverImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setIsUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'Members');
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Cloudinary source of truth: only update state when a real HTTPS URL is returned
      const cloudUrl = res.data?.media?.url || res.data?.data?.url || res.data?.url;
      if (cloudUrl && cloudUrl.startsWith('http')) {
        const publicId = res.data?.media?.publicId || res.data?.data?.publicId || '';
        setEditForm(prev => ({ ...prev, coverPhoto: cloudUrl, coverPhotoPublicId: publicId }));
        setCoverError(false);
      } else {
        throw new Error('Upload succeeded but returned an invalid URL.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cover upload failed.';
      setUploadError(`Cover upload failed: ${msg}`);
      console.error('[ProfilePage] Cover upload error:', err);
      // Preserve existing cover — do not mutate state
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [targetId, authMember]);

  const loadProfileData = async () => {
    setLoading(true);
    if (isOwner && authMember) {
      setProfile(authMember);
      setEditForm({
        bio: authMember.bio || '',
        about: authMember.about || '',
        photo: authMember.photo || '',
        coverPhoto: authMember.coverPhoto || '',
        github: authMember.github || '',
        linkedin: authMember.linkedin || '',
        portfolio: authMember.portfolio || '',
        instagram: authMember.instagram || '',
        website: authMember.website || '',
        skills: authMember.skills || ['React', 'JavaScript'],
        expertise: authMember.expertise || ['Web Development']
      });
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/members/${targetId}/profile`);
      const data = res.data.data;
      setProfile(data);
      setEditForm({
        bio: data.bio || '',
        about: data.about || '',
        photo: data.photo || '',
        coverPhoto: data.coverPhoto || '',
        github: data.github || '',
        linkedin: data.linkedin || '',
        portfolio: data.portfolio || '',
        instagram: data.instagram || '',
        website: data.website || '',
        skills: data.skills || ['React', 'Node.js'],
        expertise: data.expertise || ['Frontend Development']
      });
    } catch (err) {
      const fallback = authMember || {
        _id: currentMemberId,
        name: user?.username || 'Community Member',
        email: user?.email || 'member@gfgcampus.org',
        role: 'Visitor',
        teamName: 'General',
        accountType: 'Visitor',
        membershipStatus: 'pending',
        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Member')}&background=2f9e44&color=fff&bold=true`
      };
      setProfile(fallback);
    }

    // Load Posts
    try {
      const postsRes = await api.get('/posts', { params: { filter: 'My Posts', memberId: targetId } });
      setUserPosts(postsRes.data.data || []);
    } catch (e) {
      setUserPosts([]);
    }

    if (isOwner) {
      try {
        const savedRes = await api.get('/posts', { params: { filter: 'Saved', memberId: targetId } });
        setSavedPosts(savedRes.data.data || []);
      } catch (e) {
        setSavedPosts([]);
      }
    }

    setLoading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.patch(`/members/${targetId}/profile`, editForm);
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      setProfile(prev => ({ ...prev, ...editForm }));
    }
    setIsSavingProfile(false);
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !editForm.skills.includes(newSkillInput.trim())) {
      setEditForm(prev => ({ ...prev, skills: [...prev.skills, newSkillInput.trim()] }));
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setEditForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleAddExpertise = () => {
    if (newExpertiseInput.trim() && !editForm.expertise.includes(newExpertiseInput.trim())) {
      setEditForm(prev => ({ ...prev, expertise: [...prev.expertise, newExpertiseInput.trim()] }));
      setNewExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (exp) => {
    setEditForm(prev => ({ ...prev, expertise: prev.expertise.filter(e => e !== exp) }));
  };

  const handleDeleteOwnPost = async (postId) => {
    if (!window.confirm('Delete post? This post and its discussion will be permanently removed.')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setUserPosts(prev => prev.filter(p => p._id !== postId));
      setSavedPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      setUserPosts(prev => prev.filter(p => p._id !== postId));
    }
  };

  if (!isAuthenticated && isOwner) {
    return (
      <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 max-w-md mx-auto text-center space-y-4">
          <TechCard className="p-8 bg-[#121721] border-[#30363d] space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#2f9e44]/20 border border-[#2f9e44]/40 text-[#2f9e44] flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Sign in to view your profile</h2>
            <p className="text-xs text-gray-400">
              Access your official community identity, saved posts, and digital membership card.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => openAuthModal('login')} className="flex-1 py-2.5 rounded-xl bg-[#21262d] text-white text-xs font-bold border border-[#30363d]">
                Sign In
              </button>
              <button onClick={() => openAuthModal('signup')} className="flex-1 py-2.5 rounded-xl gradient-button text-xs font-bold">
                Join Community
              </button>
            </div>
          </TechCard>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-100 flex flex-col font-sans">
      <Navbar />

      {/* Change Password Modal Component */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        
        <TechHeader
          tag="08 // DEVELOPER PROFILE"
          title={isOwner ? "Your Student Developer Identity" : `${profile?.name || 'Member'}'s Developer Profile`}
          description="Official chapter credentials, member contributions, skills, and community activity."
        />

        {loading ? (
          <div className="text-center py-16 text-gray-400 font-mono">Loading Member Profile...</div>
        ) : profile && (
          <div className="space-y-8">

            {/* Profile Banner & Header Card */}
            <TechCard className="border-[#30363d] bg-[#121721] overflow-hidden">
              
              {/* Optional Cover Banner */}
              <div className="h-36 sm:h-48 w-full bg-gradient-to-r from-[#18202c] via-[#121721] to-[#1e1338] relative">
                {isValidMediaUrl(profile.coverPhoto) && !coverError && (
                  <img
                    src={profile.coverPhoto}
                    alt="Cover"
                    className="w-full h-full object-cover opacity-60"
                    onError={() => setCoverError(true)}
                  />
                )}
                {isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-mono font-bold border border-[#30363d] backdrop-blur hidden md:flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                )}
              </div>

              {/* Profile Details Header */}
              <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                    <img
                      src={avatarError ? resolveAvatarUrl('', profile.name) : resolveAvatarUrl(profile.photo, profile.name)}
                      alt={profile.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#2f9e44] bg-[#0a0d12] shadow-2xl"
                      onError={() => setAvatarError(true)}
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{profile.name}</h1>
                        <RoleBadge role={profile.role || 'Visitor'} />
                        {profile.accountType === 'Visitor' && (
                          <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold uppercase">
                            Visitor Account
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-gray-400">{profile.email} • {profile.teamName || 'General'}</p>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="sm:hidden px-4 py-2 rounded-xl gradient-button text-xs font-bold flex items-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                  )}
                </div>

                {/* Bio Statement */}
                {profile.bio && (
                  <p className="text-sm text-gray-300 italic leading-relaxed pt-2 border-t border-[#30363d]/60">
                    "{profile.bio}"
                  </p>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[#0a0d12] border border-[#30363d] hover:border-[#2f9e44] text-gray-300 hover:text-white transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[#0a0d12] border border-[#30363d] hover:border-[#2f9e44] text-gray-300 hover:text-white transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile.portfolio && (
                    <a href={profile.portfolio} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[#0a0d12] border border-[#30363d] hover:border-[#2f9e44] text-gray-300 hover:text-white transition-colors">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>

              </div>
            </TechCard>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[#30363d] pb-2 overflow-x-auto no-scrollbar snap-x">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  activeTab === 'overview' ? 'bg-[#2f9e44] text-white shadow' : 'text-gray-400 hover:text-white hover:bg-[#18202c]'
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  activeTab === 'posts' ? 'bg-[#2f9e44] text-white shadow' : 'text-gray-400 hover:text-white hover:bg-[#18202c]'
                }`}
              >
                Posts ({userPosts.length})
              </button>

              {isOwner && (
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                    activeTab === 'saved' ? 'bg-[#2f9e44] text-white shadow' : 'text-gray-400 hover:text-white hover:bg-[#18202c]'
                  }`}
                >
                  Saved ({savedPosts.length})
                </button>
              )}

              {/* Membership Card Tab: ALWAYS visible on owner profile */}
              {isOwner && (
                <button
                  onClick={() => setActiveTab('card')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                    activeTab === 'card' ? 'bg-[#2f9e44] text-white shadow' : 'text-gray-400 hover:text-white hover:bg-[#18202c]'
                  }`}
                >
                  Membership Card
                </button>
              )}

              {/* Settings Tab: STRICTLY OWNER ONLY */}
              {isOwner && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                    activeTab === 'settings' ? 'bg-[#2f9e44] text-white shadow' : 'text-gray-400 hover:text-white hover:bg-[#18202c]'
                  }`}
                >
                  Settings
                </button>
              )}
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Tech Skills */}
                <TechCard className="p-6 bg-[#121721] border-[#30363d] space-y-3">
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Tech Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills && profile.skills.map((s, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-[#0a0d12] text-gray-200 text-xs font-mono font-semibold border border-[#30363d]">
                        {s}
                      </span>
                    ))}
                  </div>
                </TechCard>

                {/* Expertise */}
                <TechCard className="p-6 bg-[#121721] border-[#30363d] space-y-3">
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Areas of Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise && profile.expertise.map((e, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-[#18202c] text-[#2f9e44] text-xs font-mono font-semibold border border-[#2f9e44]/30">
                        {e}
                      </span>
                    ))}
                  </div>
                </TechCard>

              </div>
            )}

            {/* TAB CONTENT: POSTS */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {userPosts.length === 0 ? (
                  <TechCard className="p-12 text-center bg-[#121721] border-[#30363d]">
                    <p className="text-sm text-gray-400">No community posts created yet.</p>
                  </TechCard>
                ) : (
                  userPosts.map((post) => (
                    <TechCard key={post._id} className="p-5 bg-[#121721] border-[#30363d] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase px-2 py-0.5 rounded bg-[#2f9e44]/15 border border-[#2f9e44]/30">
                            {post.postType}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>

                        {isOwner && (
                          <button
                            onClick={() => handleDeleteOwnPost(post._id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <Link to={`/community/post/${post._id}`} className="text-base font-bold text-white hover:text-[#2f9e44] block">
                        {post.title || post.content.substring(0, 60)}
                      </Link>
                      <p className="text-xs text-gray-300 line-clamp-2">{post.content}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-[#30363d]">
                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-400" /> {post.likesCount || 0}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-gray-400" /> {post.commentsCount || 0}</span>
                      </div>
                    </TechCard>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: SAVED POSTS (OWNER ONLY) */}
            {activeTab === 'saved' && isOwner && (
              <div className="space-y-4">
                {savedPosts.length === 0 ? (
                  <TechCard className="p-12 text-center bg-[#121721] border-[#30363d]">
                    <p className="text-sm text-gray-400">No saved posts in your collection.</p>
                  </TechCard>
                ) : (
                  savedPosts.map((post) => (
                    <TechCard key={post._id} className="p-5 bg-[#121721] border-[#30363d] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-[#2f9e44] uppercase px-2 py-0.5 rounded bg-[#2f9e44]/15 border border-[#2f9e44]/30">
                          {post.postType}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">Saved Post</span>
                      </div>

                      <Link to={`/community/post/${post._id}`} className="text-base font-bold text-white hover:text-[#2f9e44] block">
                        {post.title || post.content.substring(0, 60)}
                      </Link>
                      <p className="text-xs text-gray-300 line-clamp-2">{post.content}</p>
                    </TechCard>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: DIGITAL MEMBERSHIP CARD */}
            {activeTab === 'card' && isOwner && (
              <MembershipCard member={profile} isOwner={isOwner} />
            )}

            {/* TAB CONTENT: ACCOUNT SETTINGS & SECURITY (OWNER ONLY) */}
            {activeTab === 'settings' && isOwner && (
              <div className="space-y-6">
                
                {/* Settings Sub-Navigation */}
                <div className="flex border-b border-[#30363d] gap-6">
                  <button
                    onClick={() => setSettingsSubTab('profile')}
                    className={`pb-2.5 text-xs font-bold font-mono transition-colors border-b-2 ${
                      settingsSubTab === 'profile'
                        ? 'border-[#2f9e44] text-[#2f9e44]'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    Profile Settings
                  </button>

                  <button
                    onClick={() => setSettingsSubTab('security')}
                    className={`pb-2.5 text-xs font-bold font-mono transition-colors border-b-2 flex items-center gap-1.5 ${
                      settingsSubTab === 'security'
                        ? 'border-[#2f9e44] text-[#2f9e44]'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" /> Security
                  </button>
                </div>

                {settingsSubTab === 'profile' ? (
                  <TechCard className="p-6 sm:p-8 bg-[#121721] border-[#30363d] space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">Profile Details</h3>
                      <p className="text-xs text-gray-400">Update your public bio, developer links, technical skills, and avatar image.</p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2.5 rounded-xl gradient-button text-xs font-bold inline-flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Profile Details
                      </button>
                    </div>
                  </TechCard>
                ) : (
                  /* SECURITY SUB-TAB */
                  <TechCard className="p-6 sm:p-8 bg-[#121721] border-[#30363d] space-y-6">
                    <div className="space-y-1 border-b border-[#30363d] pb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-[#2f9e44]" /> Security Settings
                      </h3>
                      <p className="text-xs text-gray-400">
                        Manage your account authentication credentials and security options.
                      </p>
                    </div>

                    {/* Password Control Box */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0d12] border border-[#30363d]">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white block">Password</span>
                        <span className="text-xs font-mono text-gray-400 block tracking-widest">••••••••••••</span>
                      </div>

                      <button
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="px-4 py-2.5 rounded-xl gradient-button text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Change Password
                      </button>
                    </div>
                  </TechCard>
                )}

              </div>
            )}

          </div>
        )}

        {/* PROFILE EDIT MODAL */}
        {isEditing && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <TechCard className="w-full max-w-2xl p-6 sm:p-8 bg-[#121721] border-[#2f9e44] space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Upload Error Banner */}
              {uploadError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#2f9e44]" /> Edit Personal Profile
                </h3>
                <button onClick={() => setIsEditing(false)} className="p-1 rounded-lg hover:bg-[#18202c] text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                
                {/* Hidden Image Inputs */}
                <input
                  type="file"
                  ref={photoInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoImageSelect}
                />
                <input
                  type="file"
                  ref={coverInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleCoverImageSelect}
                />

                {/* Cover Banner Visual Editor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-gray-300">Cover Banner</label>
                  <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-[#30363d] bg-[#0a0d12] group">
                    {isValidMediaUrl(editForm.coverPhoto) ? (
                      <img
                        src={editForm.coverPhoto}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#18202c] via-[#121721] to-[#1e1338] flex items-center justify-center text-xs font-mono text-gray-500">
                        Default Platform Cover Banner
                      </div>
                    )}

                    {isUploadingCover && (
                      <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-xs font-mono text-[#2f9e44] font-bold">
                        Uploading Cover Image...
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-[#2f9e44] hover:bg-[#258237] text-white text-xs font-bold shadow flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" /> Change Cover
                      </button>
                      {editForm.coverPhoto && (
                        <button
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, coverPhoto: '' }))}
                          className="px-3 py-1.5 rounded-xl bg-red-500/80 hover:bg-red-600 text-white text-xs font-bold shadow"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Photo Visual Avatar Editor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-gray-300">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div
                      className="relative group cursor-pointer flex-shrink-0"
                      onClick={() => !isUploadingPhoto && photoInputRef.current?.click()}
                    >
                      <img
                        src={resolveAvatarUrl(editForm.photo, profile.name)}
                        alt="Avatar Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-[#2f9e44] shadow-md"
                        onError={(e) => { e.target.src = resolveAvatarUrl('', profile.name); }}
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera className="w-6 h-6" />
                      </div>

                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/75 rounded-2xl flex items-center justify-center text-[10px] font-mono text-[#2f9e44] font-bold">
                          Uploading...
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-xl bg-[#2f9e44] hover:bg-[#258237] text-white text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <Camera className="w-3.5 h-3.5" /> Change Photo
                        </button>
                        {editForm.photo && (
                          <button
                            type="button"
                            onClick={() => setEditForm(prev => ({ ...prev, photo: '' }))}
                            className="px-3 py-1.5 rounded-xl bg-[#18202c] hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs font-bold border border-[#30363d]"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono">Supports JPG, PNG, WEBP, GIF (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-gray-300">Bio Statement</label>
                  <textarea
                    rows={2}
                    value={editForm.bio}
                    onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-[#0a0d12] border border-[#30363d] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                  />
                </div>

                {/* Tech Skills (+ Add / Remove) */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-gray-300">Technical Skills</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add skill (e.g. React, Python)..."
                      value={newSkillInput}
                      onChange={e => setNewSkillInput(e.target.value)}
                      className="flex-1 bg-[#0a0d12] border border-[#30363d] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                    />
                    <button type="button" onClick={handleAddSkill} className="px-3 py-2 rounded-xl gradient-button text-xs font-bold">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editForm.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[#0a0d12] text-xs font-mono text-gray-200 border border-[#30363d] inline-flex items-center gap-1.5">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-red-400 hover:text-red-300">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Areas of Expertise (+ Add / Remove) */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-gray-300">Areas of Expertise</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add expertise (e.g. System Design)..."
                      value={newExpertiseInput}
                      onChange={e => setNewExpertiseInput(e.target.value)}
                      className="flex-1 bg-[#0a0d12] border border-[#30363d] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                    />
                    <button type="button" onClick={handleAddExpertise} className="px-3 py-2 rounded-xl gradient-button text-xs font-bold">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {editForm.expertise.map((exp, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[#18202c] text-xs font-mono text-[#2f9e44] border border-[#2f9e44]/30 inline-flex items-center gap-1.5">
                        {exp}
                        <button type="button" onClick={() => handleRemoveExpertise(exp)} className="text-red-400 hover:text-red-300">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">GitHub</label>
                    <input
                      type="text"
                      value={editForm.github}
                      onChange={e => setEditForm(prev => ({ ...prev, github: e.target.value }))}
                      className="w-full bg-[#0a0d12] border border-[#30363d] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">LinkedIn</label>
                    <input
                      type="text"
                      value={editForm.linkedin}
                      onChange={e => setEditForm(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full bg-[#0a0d12] border border-[#30363d] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-gray-400 uppercase">Portfolio</label>
                    <input
                      type="text"
                      value={editForm.portfolio}
                      onChange={e => setEditForm(prev => ({ ...prev, portfolio: e.target.value }))}
                      className="w-full bg-[#0a0d12] border border-[#30363d] rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#2f9e44]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#30363d] flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl bg-[#18202c] text-xs font-bold text-gray-300">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSavingProfile} className="px-6 py-2 rounded-xl gradient-button text-xs font-bold">
                    {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>

              </form>
            </TechCard>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
