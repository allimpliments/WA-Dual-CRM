// js/config.js — Firebase Configuration & Global Settings for SaaS Platform
// ============================================================
// FIREBASE INITIALIZATION
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyBZDaHJSt-4AV6EJYG76p8kcsIHf6LOxdU",
  authDomain: "avatar-wa-dual-crm.firebaseapp.com",
  projectId: "avatar-wa-dual-crm",
  storageBucket: "avatar-wa-dual-crm.firebasestorage.app",
  messagingSenderId: "946959261009",
  appId: "1:946959261009:web:db7ce59b52e454caf8c770"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ============================================================
// GLOBAL FIREBASE SERVICES
// ============================================================
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ============================================================
// FIRESTORE SETTINGS
// ============================================================
// Enable offline persistence for better UX
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence.');
  }
});

// Firestore settings for better performance
db.settings({
  // merge: true is default, timestampsInSnapshots is no longer needed in newer SDK
  ignoreUndefinedProperties: true // Ignore undefined properties instead of throwing errors
});

// ============================================================
// AUTH SETTINGS
// ============================================================
// Set auth persistence to LOCAL (survives browser close)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
  console.error('Auth persistence error:', err);
});

// ============================================================
// GLOBAL PLATFORM CONFIGURATION
// ============================================================
const PLATFORM_CONFIG = {
  // Platform Info
  platformName: '11 Avatar Digital Hub CRM',
  platformVersion: '2.0.0',
  platformUrl: window.location.origin,
  
  // WhatsApp Business API
  whatsappPhoneNumberId: '342856675576986',
  whatsappBusinessId: '342354115627791',
  
  // API Endpoints
  metaApiVersion: 'v22.0',
  metaApiBase: 'https://graph.facebook.com/v22.0',
  
  // Supported Languages
  supportedLanguages: ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'mai'],
  
  // Default Settings
  defaultCurrency: 'INR',
  defaultTimezone: 'Asia/Kolkata',
  defaultDateFormat: 'DD/MM/YYYY',
  
  // Feature Flags
  features: {
    whatsappIntegration: true,
    facebookIntegration: true,
    instagramIntegration: true,
    linkedinIntegration: false,
    youtubeIntegration: false,
    telegramIntegration: false,
    emailIntegration: false,
    aiChatbot: true,
    whiteLabel: true,
    multiTenant: true,
    exportReports: true,
    customDomains: false,
    paymentGateway: false,
  },
  
  // Limits
  limits: {
    freePlan: { maxUsers: 1, maxContacts: 500, maxCampaigns: 10, maxMessagesPerDay: 100 },
    advancePlan: { maxUsers: 5, maxContacts: 5000, maxCampaigns: 50, maxMessagesPerDay: 1000 },
    professionalPlan: { maxUsers: 20, maxContacts: 50000, maxCampaigns: 200, maxMessagesPerDay: 10000 },
    enterprisePlan: { maxUsers: 100, maxContacts: 999999, maxCampaigns: 999, maxMessagesPerDay: 999999 },
  },
  
  // Module List (for permissions and plan assignment)
  availableModules: [
    'dashboard', 'leads', 'contacts', 'chats', 'campaigns', 'templates', 'flows',
    'social', 'forms', 'kanban', 'knowledge', 'chatbot', 'ecommerce', 'appointments',
    'analytics', 'tickets', 'integrations', 'agents', 'clients', 'marketing', 'setup', 'reports'
  ],
  
  // Lead Statuses
  leadStatuses: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
  
  // Campaign Types
  campaignTypes: ['bulk', 'drip'],
  
  // Message Types
  messageTypes: ['text', 'image', 'video', 'audio', 'document', 'template', 'interactive'],
  
  // Social Media Platforms
  socialPlatforms: [
    { id: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877f2' },
    { id: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2' },
    { id: 'twitter', name: 'Twitter/X', icon: 'fa-twitter', color: '#1DA1F2' },
    { id: 'youtube', name: 'YouTube', icon: 'fa-youtube', color: '#FF0000' },
    { id: 'pinterest', name: 'Pinterest', icon: 'fa-pinterest', color: '#E60023' },
    { id: 'snapchat', name: 'Snapchat', icon: 'fa-snapchat', color: '#FFFC00' },
    { id: 'tiktok', name: 'TikTok', icon: 'fa-tiktok', color: '#000000' },
    { id: 'reddit', name: 'Reddit', icon: 'fa-reddit', color: '#FF4500' },
    { id: 'telegram', name: 'Telegram', icon: 'fa-telegram', color: '#0088cc' },
  ]
};

// ============================================================
// GLOBAL HELPER FUNCTIONS
// ============================================================

/**
 * Get current user's client ID
 * @returns {string|null}
 */
function getCurrentClientId() {
  return window.currentUser?.clientId || null;
}

/**
 * Check if data should be filtered by client ID
 * Platform owners and super admins see all data
 * @returns {boolean}
 */
function shouldFilterByClient() {
  const user = window.currentUser;
  if (!user) return false;
  if (user.role === 'platform_owner' || user.role === 'platform_super_admin' || user.role === 'admin') return false;
  return !!user.clientId;
}

/**
 * Get current user's role
 * @returns {string}
 */
function getCurrentUserRole() {
  return window.currentUser?.role || 'client';
}

/**
 * Check if current user is platform admin
 * @returns {boolean}
 */
function isPlatformAdmin() {
  const role = getCurrentUserRole();
  return role === 'platform_owner' || role === 'platform_super_admin' || role === 'admin';
}

/**
 * Check if current user is client user
 * @returns {boolean}
 */
function isClientUser() {
  return !!getCurrentClientId() && !isPlatformAdmin();
}

/**
 * Get plan limits for current user
 * @returns {object}
 */
function getCurrentPlanLimits() {
  const plan = window.currentUser?.plan || 'free';
  return PLATFORM_CONFIG.limits[plan + 'Plan'] || PLATFORM_CONFIG.limits.freePlan;
}

/**
 * Format currency as INR
 * @param {number} amount 
 * @returns {string}
 */
function formatCurrency(amount) {
  return '₹' + (parseInt(amount) || 0).toLocaleString('en-IN');
}

/**
 * Format date to locale string
 * @param {Date|firebase.firestore.Timestamp} date 
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Format date and time
 * @param {Date|firebase.firestore.Timestamp} date 
 * @returns {string}
 */
function formatDateTime(date) {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} length 
 * @returns {string}
 */
function truncateText(text, length = 50) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Generate a random ID
 * @param {number} length 
 * @returns {string}
 */
function generateId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get initials from name
 * @param {string} name 
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Get avatar color based on name
 * @param {string} name 
 * @returns {string}
 */
function getAvatarColor(name) {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
    '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316'
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Debounce function for search inputs
 * @param {function} func 
 * @param {number} wait 
 * @returns {function}
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Show a toast notification
 * @param {string} message 
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.global-toast').forEach(t => t.remove());
  
  const colors = {
    success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46', icon: 'fa-check-circle' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: 'fa-times-circle' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: 'fa-exclamation-triangle' },
    info: { bg: '#eef2ff', border: '#6366f1', text: '#3730a3', icon: 'fa-info-circle' }
  };
  
  const c = colors[type] || colors.info;
  
  const toast = document.createElement('div');
  toast.className = 'global-toast';
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.text};
    padding: 12px 20px; border-radius: 12px; font-size: 14px; font-weight: 500;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    animation: slideInRight 0.3s ease;
    max-width: 400px;
  `;
  toast.innerHTML = `<i class="fas ${c.icon}" style="font-size:18px;"></i> ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Confirm dialog with custom message
 * @param {string} message 
 * @returns {Promise<boolean>}
 */
function showConfirm(message = 'Are you sure?') {
  return new Promise((resolve) => {
    const result = confirm(message);
    resolve(result);
  });
}

// ============================================================
// ERROR HANDLING
// ============================================================

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent default console error
  event.preventDefault();
});

// Global error handler
window.addEventListener('error', function(event) {
  console.error('Global error:', event.error);
  // You can send this to an error tracking service
});

// ============================================================
// LOGGING
// ============================================================

const Logger = {
  info: function(message, data = null) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },
  warn: function(message, data = null) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  },
  error: function(message, data = null) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data || '');
  },
  debug: function(message, data = null) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }
};

// ============================================================
// INITIALIZATION LOG
// ============================================================
Logger.info('Firebase initialized successfully');
Logger.info(`Platform: ${PLATFORM_CONFIG.platformName} v${PLATFORM_CONFIG.platformVersion}`);
Logger.info(`Environment: ${window.location.hostname === 'localhost' ? 'Development' : 'Production'}`);
Logger.info(`Firestore Persistence: Enabled`);
Logger.info(`Auth Persistence: LOCAL`);

// Make PLATFORM_CONFIG globally available
window.PLATFORM_CONFIG = PLATFORM_CONFIG;
