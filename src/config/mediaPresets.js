/**
 * Centralized Media & Image Crop Presets
 * 
 * Defines canonical aspect ratios, max resolution bounds, and rendering masks
 * across the GeeksforGeeks Campus Body platform.
 */

export const MEDIA_PRESETS = {
  eventThumbnail: {
    id: 'eventThumbnail',
    label: 'Event Thumbnail',
    aspectRatio: 16 / 9,
    targetWidth: 1200,
    targetHeight: 675,
    maxOutputDimension: 2400,
    isCircular: false,
    helperText: 'Adjust how this thumbnail appears across Event cards on Homepage and Events page.'
  },
  announcementBanner: {
    id: 'announcementBanner',
    label: 'Announcement Banner',
    aspectRatio: 16 / 9,
    targetWidth: 1200,
    targetHeight: 675,
    maxOutputDimension: 2400,
    isCircular: false,
    helperText: 'Adjust banner positioning for top announcements and bulletin cards.'
  },
  avatar: {
    id: 'avatar',
    label: 'Profile Avatar',
    aspectRatio: 1,
    targetWidth: 600,
    targetHeight: 600,
    maxOutputDimension: 1600,
    isCircular: true,
    helperText: 'Position your face inside the circular avatar mask.'
  },
  profileCover: {
    id: 'profileCover',
    label: 'Profile Cover',
    aspectRatio: 3 / 1,
    targetWidth: 1600,
    targetHeight: 533,
    maxOutputDimension: 2400,
    isCircular: false,
    helperText: 'Position your header cover photo for desktop and mobile viewports.'
  },
  teamMember: {
    id: 'teamMember',
    label: 'Team Member Photo',
    aspectRatio: 1,
    targetWidth: 600,
    targetHeight: 600,
    maxOutputDimension: 1600,
    isCircular: false,
    helperText: 'Adjust team member headshot photo.'
  },
  faculty: {
    id: 'faculty',
    label: 'Faculty Photo',
    aspectRatio: 3 / 4,
    targetWidth: 600,
    targetHeight: 800,
    maxOutputDimension: 1600,
    isCircular: false,
    helperText: 'Adjust faculty coordinator headshot photo.'
  },
  gallery: {
    id: 'gallery',
    label: 'Gallery Photo',
    aspectRatio: null, // Free / Original default
    allowedAspects: ['original', '1:1', '4:5', '16:9'],
    targetWidth: 1920,
    targetHeight: 1080,
    maxOutputDimension: 2400,
    isCircular: false,
    helperText: 'Optionally adjust framing or aspect ratio for gallery photo.'
  },
  communityPost: {
    id: 'communityPost',
    label: 'Community Post Photo',
    aspectRatio: null, // Free / Original default
    allowedAspects: ['original', '1:1', '4:5', '16:9'],
    targetWidth: 1920,
    targetHeight: 1080,
    maxOutputDimension: 2400,
    isCircular: false,
    helperText: 'Optionally adjust framing or aspect ratio for your community post photo.'
  }
};

export default MEDIA_PRESETS;
