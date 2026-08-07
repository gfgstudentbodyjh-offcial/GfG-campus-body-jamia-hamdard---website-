/**
 * Lightweight In-Memory Community Cache
 * Prevents unnecessary full-page skeleton re-renders during navigation, likes, comments, and profile views.
 */

const CACHE_TTL_MS = 60000; // 60 seconds stale time

const cacheStore = {
  feed: {},
  profiles: {},
  posts: {}
};

export const getCachedFeed = (key = 'all') => {
  const item = cacheStore.feed[key];
  if (!item) return null;
  return item.data;
};

export const setCachedFeed = (key = 'all', data = []) => {
  cacheStore.feed[key] = {
    data,
    timestamp: Date.now()
  };
};

export const getCachedProfile = (key) => {
  if (!key) return null;
  const item = cacheStore.profiles[key.toLowerCase()];
  if (!item) return null;
  return item.data;
};

export const setCachedProfile = (key, data) => {
  if (!key || !data) return;
  cacheStore.profiles[key.toLowerCase()] = {
    data,
    timestamp: Date.now()
  };
};

export const patchCachedPost = (postId, updater) => {
  if (!postId || !updater) return;

  // Patch in all cached feed categories
  Object.keys(cacheStore.feed).forEach((key) => {
    if (cacheStore.feed[key]?.data) {
      cacheStore.feed[key].data = cacheStore.feed[key].data.map((p) => {
        if (String(p._id) === String(postId)) {
          return typeof updater === 'function' ? updater(p) : { ...p, ...updater };
        }
        return p;
      });
    }
  });
};

export const removeCachedPost = (postId) => {
  if (!postId) return;

  Object.keys(cacheStore.feed).forEach((key) => {
    if (cacheStore.feed[key]?.data) {
      cacheStore.feed[key].data = cacheStore.feed[key].data.filter(
        (p) => String(p._id) !== String(postId)
      );
    }
  });
};

export const clearCommunityCache = () => {
  cacheStore.feed = {};
  cacheStore.profiles = {};
  cacheStore.posts = {};
};
