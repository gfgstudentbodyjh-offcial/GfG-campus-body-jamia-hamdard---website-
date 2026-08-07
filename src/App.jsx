import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import Home from './pages/public/Home';
import TeamsPage from './pages/public/TeamsPage';
import EventsPage from './pages/public/EventsPage';
import GalleryPage from './pages/public/GalleryPage';
import ResourcesPage from './pages/public/ResourcesPage';
import CampusMantriHistory from './pages/public/CampusMantriHistory';
import FormViewerPage from './pages/public/FormViewerPage';
import CommunityFeed from './pages/public/CommunityFeed';
import PostDetailPage from './pages/public/PostDetailPage';
import LeaderboardPage from './pages/public/LeaderboardPage';
import ProfilePage from './pages/public/ProfilePage';
import MemberVerificationPage from './pages/public/MemberVerificationPage';

// Admin Pages & Protected Layout
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import MembersAdmin from './pages/admin/MembersAdmin';
import TeamsAdmin from './pages/admin/TeamsAdmin';
import FacultyAdmin from './pages/admin/FacultyAdmin';
import MantriAdmin from './pages/admin/MantriAdmin';
import EventsAdmin from './pages/admin/EventsAdmin';
import GalleryAdmin from './pages/admin/GalleryAdmin';
import ResourcesAdmin from './pages/admin/ResourcesAdmin';
import AnnouncementsAdmin from './pages/admin/AnnouncementsAdmin';
import FormsAdmin from './pages/admin/FormsAdmin';
import MediaLibraryAdmin from './pages/admin/MediaLibraryAdmin';
import HeroSettingsAdmin from './pages/admin/HeroSettingsAdmin';
import AnalyticsSettingsAdmin from './pages/admin/AnalyticsSettingsAdmin';
import FeedModerationAdmin from './pages/admin/FeedModerationAdmin';
import AdministratorsAdmin from './pages/admin/AdministratorsAdmin';
import UserDirectoryAdmin from './pages/admin/UserDirectoryAdmin';
import ScrollToTop from './components/common/ScrollToTop';

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* Public & Member Space Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/campus-mantri" element={<CampusMantriHistory />} />
        <Route path="/mantri-history" element={<CampusMantriHistory />} />
        <Route path="/forms/:formId" element={<FormViewerPage />} />
        <Route path="/community" element={<CommunityFeed />} />
        <Route path="/community/post/:postId" element={<PostDetailPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/members/:memberId" element={<ProfilePage />} />
        <Route path="/verify/member/:verificationId" element={<MemberVerificationPage />} />

        {/* Super Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Super Admin SaaS Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardHome />} />
          <Route path="users" element={<UserDirectoryAdmin />} />
          <Route path="members" element={<MembersAdmin />} />
          <Route path="teams" element={<TeamsAdmin />} />
          <Route path="faculty" element={<FacultyAdmin />} />
          <Route path="mantri" element={<MantriAdmin />} />
          <Route path="events" element={<EventsAdmin />} />
          <Route path="gallery" element={<GalleryAdmin />} />
          <Route path="resources" element={<ResourcesAdmin />} />
          <Route path="announcements" element={<AnnouncementsAdmin />} />
          <Route path="forms" element={<FormsAdmin />} />
          <Route path="media" element={<MediaLibraryAdmin />} />
          <Route path="hero-settings" element={<HeroSettingsAdmin />} />
          <Route path="analytics-settings" element={<AnalyticsSettingsAdmin />} />
          <Route path="feed-moderation" element={<FeedModerationAdmin />} />
          <Route path="administrators" element={<AdministratorsAdmin />} />
        </Route>

        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
