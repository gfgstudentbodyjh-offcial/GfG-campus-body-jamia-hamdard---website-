import React, { useState, useEffect } from 'react';
import ContentCrudModule from '../../components/admin/ContentCrudModule';
import api from '../../services/api';
import { Pin, Trash2, ShieldCheck, Heart, MessageSquare } from 'lucide-react';

export default function FeedModerationAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts');
      setPosts(res.data.data || []);
    } catch (err) {
      console.warn(err);
    }
    setLoading(false);
  };

  const handleTogglePin = async (id) => {
    try {
      await api.patch(`/posts/${id}/pin`);
      loadPosts();
    } catch (err) {
      alert('Toggle pin failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Moderator Delete: Permanently remove this community post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      loadPosts();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <ContentCrudModule
        title="Community Feed Moderation"
        subtitle="Super Admin moderation dashboard: Pin featured posts to feed top or delete reported posts."
        items={posts}
        loading={loading}
        onAdd={() => alert('Posts are created directly by community members on /community feed.')}
        columns={['Post Title & Content', 'Category', 'Likes / Comments', 'Pinned Spotlight']}
        renderRow={(p) => (
          <tr key={p._id} className="hover:bg-[#0d1117]/60 transition-colors">
            <td className="px-6 py-4">
              <div>
                <p className="font-bold text-white text-sm">{p.title || 'Untitled Thought'}</p>
                <p className="text-[10px] text-gray-400 max-w-sm truncate">{p.content}</p>
                <p className="text-[9px] text-[#2f9e44] mt-0.5">Author: {p.authorRef?.name || 'Member'}</p>
              </div>
            </td>
            <td className="px-6 py-4 text-xs font-semibold text-gray-300">{p.postType}</td>
            <td className="px-6 py-4 text-xs text-gray-400">
              ❤️ {p.likesCount || 0} • 💬 {p.commentsCount || 0}
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => handleTogglePin(p._id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  p.isPinned
                    ? 'bg-[#2f9e44] text-white shadow-md'
                    : 'bg-[#21262d] text-gray-400 hover:text-white border border-[#30363d]'
                }`}
              >
                <Pin className="w-3.5 h-3.5" /> {p.isPinned ? 'Pinned' : 'Pin Post'}
              </button>
            </td>
            <td className="px-6 py-4 text-right space-x-2">
              <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg bg-[#21262d] text-red-400 hover:bg-red-500/20">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
