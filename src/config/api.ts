// API Configuration - Handles both development and production environments
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Get API URL from environment variables with fallbacks
export const API_CONFIG = {
  // Base API URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // Socket.IO URL
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000',
  
  // API endpoints
  API_BASE: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api',
} as const;

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.API_BASE}/${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Admin endpoints
  ADMIN: {
    LOGIN: buildApiUrl('admin/login'),
    DASHBOARD: buildApiUrl('analytics/dashboard'),
    ALL_SERVICE_NEEDERS: buildApiUrl('service-needers/all'),
    COMPLETED_SERVICES: buildApiUrl('service-requests/completed-services'),
    ACTIVE_SERVICES: buildApiUrl('service-requests/active-services'),
    ALL_SERVICE_REQUESTS: buildApiUrl('service-requests/all'),
    // Admin service management endpoints
    SERVICES: buildApiUrl('service-requests'),
    SERVICES_APPROVED: buildApiUrl('service-requests/approved'),
    SERVICES_REJECTED: buildApiUrl('service-requests/rejected'),
    // Admin profile and settings endpoints
    PROFILE: buildApiUrl('admin/profile'),
    SECURITY_SETTINGS: buildApiUrl('admin/security-settings'),
  },
  
  // Service Needer endpoints
  SERVICE_NEEDER: {
    REGISTER: buildApiUrl('service-needers/register'),
    LOGIN: buildApiUrl('service-needers/login'),
    FORGOT_PASSWORD: buildApiUrl('service-needers/forgot-password'),
    RESET_PASSWORD: buildApiUrl('service-needers/reset-password'),
    FIND_PROVIDERS: buildApiUrl('service-needers/find-providers'),
    AVAILABLE_LOCATIONS: buildApiUrl('service-needers/available-locations'),
  },
  
  // Service Provider endpoints
  SERVICE_PROVIDER: {
    ALL: buildApiUrl('service-providers/all'),
    APPROVED: buildApiUrl('service-providers/approved'),
    REJECTED: buildApiUrl('service-providers/rejected'),
    APPROVE: (id: string) => buildApiUrl(`service-providers/approve/${id}`),
    REJECT: (id: string) => buildApiUrl(`service-providers/reject/${id}`),
    REGISTER: buildApiUrl('service-providers/register'),
    LOGIN: buildApiUrl('service-providers/login'),
    PROFILE: buildApiUrl('service-providers/profile'),
    UPDATE_PROFILE: buildApiUrl('service-providers/profile/update'),
    FORGOT_PASSWORD: buildApiUrl('service-providers/forgot-password'),
    RESET_PASSWORD: buildApiUrl('service-providers/reset-password'),
  },
  
  // Service Request endpoints
  SERVICE_REQUEST: {
    CREATE: buildApiUrl('service-requests/create'),
    MY_REQUESTS: buildApiUrl('service-requests/my-requests'),
    MY_REJECTED: buildApiUrl('service-requests/my-rejected-services'),
    MY_CONNECTED: buildApiUrl('service-requests/my-connected-services'),
    MY_ACTIVE: buildApiUrl('service-requests/my-active-services'),
    MY_COMPLETED: buildApiUrl('service-requests/my-completed-services'),
    ACCEPTED_SERVICE_ID: (id: string) => buildApiUrl(`service-requests/accepted-service-id/${id}`),
    PROVIDER_ACCEPTED: buildApiUrl('service-requests/provider-accepted-services'),
    START_SERVICE_OTP: (id: string) => buildApiUrl(`service-requests/start-service/${id}/generate-otp`),
    VERIFY_OTP: buildApiUrl('service-requests/start-service/verify-otp'),
    SN_NOTIFICATIONS: buildApiUrl('service-requests/sn-notifications'),
    MARK_READ: buildApiUrl('service-requests/sn-notifications/mark-read'),
    ALL_SERVICE_PROVIDERS: buildApiUrl('service-requests/all-service-providers'),
    NOTIFICATIONS: buildApiUrl('service-requests/notifications'),
    NOTIFICATION_DETAILS: (id: string) => buildApiUrl(`service-requests/notifications/${id}/details`),
    NOTIFICATIONS_MARK_READ: buildApiUrl('service-requests/notifications/mark-read'),
    REJECT_SERVICE: (id: string) => buildApiUrl(`service-requests/reject-service/${id}`),
    ACCEPT_SERVICE: (id: string) => buildApiUrl(`service-requests/${id}/accept`),
  },
} as const;

// Environment info for debugging
export const ENV_INFO = {
  isDevelopment,
  isProduction,
  apiUrl: API_CONFIG.BASE_URL,
  socketUrl: API_CONFIG.SOCKET_URL,
} as const;

// Log configuration in development
if (isDevelopment) {
  console.log('🔧 API Configuration:', ENV_INFO);
}
