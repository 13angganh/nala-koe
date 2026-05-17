/**
 * All application routes. Never use raw string URLs in components.
 * Always import from here.
 */
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  OFFLINE: '/offline',

  // Protected
  DASHBOARD: '/dashboard',
  NOTES: '/notes',
  NOTE: (id: string) => `/notes/${id}`,
  CANVAS: '/canvas',
  TIMELINE: '/timeline',
  STATS: '/stats',
  HIGHLIGHTS: '/highlights',
  ARCHIVE: '/archive',
  TRASH: '/trash',
  GRAPH: '/graph',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_APPEARANCE: '/settings/appearance',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_DATA: '/settings/data',

  // API
  API_URL_META: '/api/url-meta',
  API_WEATHER: '/api/weather',
} as const;
