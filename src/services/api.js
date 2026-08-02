import axios from 'axios';
import {
  MOCK_HOMEPAGE,
  MOCK_EVENTS,
  MOCK_TEAMS,
  MOCK_GALLERY,
  MOCK_RESOURCES,
  MOCK_MANTRI_LIST,
  MOCK_LEADERBOARD,
  MOCK_POSTS,
  MOCK_ANNOUNCEMENTS
} from './dummyData';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gfg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ─── Dummy Data Fallback Map ────────────────────────────────────────────────────
// Maps API GET endpoint patterns to their dummy data responses.
// When the backend is offline, the interceptor returns these automatically.
const FALLBACK_MAP = {
  '/events': (params) => {
    let data = [...MOCK_EVENTS];
    if (params?.status && params.status !== 'All') {
      data = data.filter(e => e.status === params.status);
    }
    return { data };
  },
  '/teams': () => ({ data: MOCK_TEAMS }),
  '/gallery': (params) => {
    let data = [...MOCK_GALLERY];
    if (params?.album && params.album !== 'All') {
      data = data.filter(g => g.album === params.album);
    }
    return { data };
  },
  '/resources': (params) => {
    let data = [...MOCK_RESOURCES];
    if (params?.category && params.category !== 'All') {
      data = data.filter(r => r.category === params.category);
    }
    return { data };
  },
  '/mantri': () => ({ data: MOCK_MANTRI_LIST }),
  '/leaderboard': () => ({ data: MOCK_LEADERBOARD }),
  '/posts': (params) => {
    let data = [...MOCK_POSTS];
    if (params?.type && params.type !== 'All') {
      data = data.filter(p => p.postType === params.type);
    }
    if (params?.tag && params.tag !== 'All') {
      const tag = params.tag.replace('#', '');
      data = data.filter(p => p.tags?.some(t => t.toLowerCase() === tag.toLowerCase()));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return { data };
  },
  '/announcements': () => ({ data: MOCK_ANNOUNCEMENTS })
};

// ─── Response Interceptor: Auto-fallback to dummy data on error ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;

    // Only apply fallback for GET requests
    if (config && config.method === 'get') {
      const rawUrl = config.url || '';
      // Strip base domain and optional /api prefix for matching
      const cleanUrl = rawUrl.replace(/^(?:https?:\/\/[^\/]+)?(?:\/api)?/, '') || '/';
      const params = config.params || {};

      // Check exact endpoint matches in fallback map
      for (const [endpoint, resolver] of Object.entries(FALLBACK_MAP)) {
        if (cleanUrl === endpoint || cleanUrl.startsWith(endpoint + '?') || cleanUrl.startsWith(endpoint + '/')) {
          console.warn(`[API Fallback] Serving fallback data for ${rawUrl}.`);
          return Promise.resolve({ data: resolver(params) });
        }
      }

      // Specific pattern matches (e.g., /forms/:id, /posts/:id/comments)
      if (url.match(/^\/forms\/.+$/)) {
        console.warn(`[API Fallback] Backend offline for ${url}, serving dummy form.`);
        return Promise.resolve({
          data: {
            data: {
              _id: 'form_dummy',
              title: 'GeeksHack 2026 Registration Form',
              description: 'Fill in your details to register for the hackathon.',
              isActive: true,
              fields: [
                { id: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
                { id: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'your.email@jamiahamdard.ac.in' },
                { id: 'year', label: 'Year of Study', type: 'select', required: true, options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
                { id: 'department', label: 'Department', type: 'text', required: true, placeholder: 'e.g. Computer Science' },
                { id: 'team_size', label: 'Team Size', type: 'select', required: true, options: ['Solo', '2 Members', '3 Members', '4 Members'] },
                { id: 'reason', label: 'Why do you want to participate?', type: 'textarea', required: false, placeholder: 'Tell us your motivation...' }
              ]
            }
          }
        });
      }

      if (url.match(/^\/posts\/.+\/comments$/)) {
        console.warn(`[API Fallback] Backend offline for ${url}, serving dummy comments.`);
        return Promise.resolve({
          data: {
            data: [
              {
                _id: 'c1',
                content: 'Great post! Really helpful notes.',
                authorRef: { name: 'Arham Raza' },
                createdAt: new Date()
              },
              {
                _id: 'c2',
                content: 'Thanks for sharing, bookmarked this for later!',
                authorRef: { name: 'Yussra Khan' },
                createdAt: new Date()
              }
            ]
          }
        });
      }
    }

    // For POST/PUT/PATCH/DELETE requests or unmatched GETs, reject normally
    return Promise.reject(error);
  }
);

// ─── Homepage Fetcher (kept for backward compat) ────────────────────────────────
export const fetchHomepage = async () => {
  try {
    const res = await api.get('/homepage');
    return res.data;
  } catch (err) {
    console.warn('Backend offline, utilizing client fallback data:', err.message);
    return MOCK_HOMEPAGE;
  }
};

export default api;
