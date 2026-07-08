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
// FIRESTORE SETTINGS — Must be before any Firestore operation
// ============================================================
db.settings({
  ignoreUndefinedProperties: true
});

// Enable offline persistence
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence limited to one tab.');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser does not support offline persistence.');
  }
});

// ============================================================
// AUTH SETTINGS
// ============================================================
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
  console.error('Auth persistence error:', err);
});

// ============================================================
// DEFAULT ROLES — Platform & Client Role Hierarchy
// ============================================================
const DEFAULT_ROLES = {
  platform_owner: {
    name: 'Platform Owner',
    level: 0,
    isPlatformRole: true,
    modules: {
      dashboard: { create: true, read: true, update: true, delete: true },
      leads: { create: true, read: true, update: true, delete: true },
      contacts: { create: true, read: true, update: true, delete: true },
      chats: { create: true, read: true, update: true, delete: true },
      campaigns: { create: true, read: true, update: true, delete: true },
      templates: { create: true, read: true, update: true, delete: true },
      flows: { create: true, read: true, update: true, delete: true },
      social: { create: true, read: true, update: true, delete: true },
      forms: { create: true, read: true, update: true, delete: true },
      kanban: { create: true, read: true, update: true, delete: true },
      knowledge: { create: true, read: true, update: true, delete: true },
      chatbot: { create: true, read: true, update: true, delete: true },
      ecommerce: { create: true, read: true, update: true, delete: true },
      appointments: { create: true, read: true, update: true, delete: true },
      analytics: { create: true, read: true, update: true, delete: true },
      tickets: { create: true, read: true, update: true, delete: true },
      integrations: { create: true, read: true, update: true, delete: true },
      agents: { create: true, read: true, update: true, delete: true },
      clients: { create: true, read: true, update: true, delete: true },
      marketing: { create: true, read: true, update: true, delete: true },
      setup: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true },
      plan: { create: true, read: true, update: true, delete: true },
      profile: { create: true, read: true, update: true, delete: true },
      admin: { create: true, read: true, update: true, delete: true }
    }
  },
  platform_super_admin: {
    name: 'Platform Super Admin',
    level: 1,
    isPlatformRole: true,
    modules: {
      dashboard: { create: true, read: true, update: true, delete: true },
      leads: { create: true, read: true, update: true, delete: true },
      contacts: { create: true, read: true, update: true, delete: true },
      chats: { create: true, read: true, update: true, delete: true },
      campaigns: { create: true, read: true, update: true, delete: true },
      templates: { create: true, read: true, update: true, delete: true },
      flows: { create: true, read: true, update: true, delete: true },
      social: { create: true, read: true, update: true, delete: true },
      forms: { create: true, read: true, update: true, delete: true },
      kanban: { create: true, read: true, update: true, delete: true },
      knowledge: { create: true, read: true, update: true, delete: true },
      chatbot: { create: true, read: true, update: true, delete: true },
      ecommerce: { create: true, read: true, update: true, delete: true },
      appointments: { create: true, read: true, update: true, delete: true },
      analytics: { create: true, read: true, update: true, delete: true },
      tickets: { create: true, read: true, update: true, delete: true },
      integrations: { create: true, read: true, update: true, delete: true },
      agents: { create: true, read: true, update: true, delete: true },
      clients: { create: true, read: true, update: true, delete: true },
      marketing: { create: true, read: true, update: true, delete: true },
      setup: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true },
      plan: { create: true, read: true, update: true, delete: true },
      profile: { create: true, read: true, update: true, delete: true },
      admin: { create: true, read: true, update: true, delete: true }
    }
  },
  admin: {
    name: 'Platform Admin',
    level: 1.5,
    isPlatformRole: true,
    modules: {
      dashboard: { create: true, read: true, update: true, delete: true },
      leads: { create: true, read: true, update: true, delete: true },
      contacts: { create: true, read: true, update: true, delete: true },
      chats: { create: true, read: true, update: true, delete: true },
      campaigns: { create: true, read: true, update: true, delete: true },
      templates: { create: true, read: true, update: true, delete: true },
      flows: { create: true, read: true, update: true, delete: true },
      social: { create: true, read: true, update: true, delete: true },
      forms: { create: true, read: true, update: true, delete: true },
      kanban: { create: true, read: true, update: true, delete: true },
      knowledge: { create: true, read: true, update: true, delete: true },
      chatbot: { create: true, read: true, update: true, delete: true },
      ecommerce: { create: true, read: true, update: true, delete: true },
      appointments: { create: true, read: true, update: true, delete: true },
      analytics: { create: true, read: true, update: true, delete: true },
      tickets: { create: true, read: true, update: true, delete: true },
      integrations: { create: true, read: true, update: true, delete: true },
      agents: { create: true, read: true, update: true, delete: true },
      clients: { create: true, read: true, update: true, delete: true },
      marketing: { create: true, read: true, update: true, delete: true },
      setup: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true },
      plan: { create: true, read: true, update: true, delete: true },
      profile: { create: true, read: true, update: true, delete: true },
      admin: { create: true, read: true, update: true, delete: true }
    }
  },
  client_owner: {
    name: 'Client Owner',
    level: 2,
    isPlatformRole: false,
    modules: {}
  },
  client_admin: {
    name: 'Client Admin',
    level: 3,
    isPlatformRole: false,
    modules: {}
  },
  manager: {
    name: 'Manager',
    level: 4,
    isPlatformRole: false,
    modules: {}
  },
  executive: {
    name: 'Executive',
    level: 5,
    isPlatformRole: false,
    modules: {}
  },
  viewer: {
    name: 'Viewer',
    level: 6,
    isPlatformRole: false,
    modules: {}
  }
};

// ============================================================
// GLOBAL PLATFORM CONFIGURATION
// ============================================================
const PLATFORM_CONFIG = {
  platformName: '11 Avatar Digital Hub CRM',
  platformVersion: '2.0.0',
  platformUrl: window.location.origin,
  whatsappPhoneNumberId: '342856675576986',
  whatsappBusinessId: '342354115627791',
  metaApiVersion: 'v22.0',
  metaApiBase: 'https://graph.facebook.com/v22.0',
  supportedLanguages: ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or', 'pa', 'as', 'mai'],
  defaultCurrency: 'INR',
  defaultTimezone: 'Asia/Kolkata',
  defaultDateFormat: 'DD/MM/YYYY',
  features: {
    whatsappIntegration: true, facebookIntegration: true, instagramIntegration: true,
    linkedinIntegration: false, youtubeIntegration: false, telegramIntegration: false,
    emailIntegration: false, aiChatbot: true, whiteLabel: true, multiTenant: true,
    exportReports: true, customDomains: false, paymentGateway: false,
  },
  limits: {
    freePlan: { maxUsers: 1, maxContacts: 500, maxCampaigns: 10, maxMessagesPerDay: 100 },
    advancePlan: { maxUsers: 5, maxContacts: 5000, maxCampaigns: 50, maxMessagesPerDay: 1000 },
    professionalPlan: { maxUsers: 20, maxContacts: 50000, maxCampaigns: 200, maxMessagesPerDay: 10000 },
    enterprisePlan: { maxUsers: 100, maxContacts: 999999, maxCampaigns: 999, maxMessagesPerDay: 999999 },
  },
  availableModules: [
    'dashboard', 'leads', 'contacts', 'chats', 'campaigns', 'templates', 'flows',
    'social', 'forms', 'kanban', 'knowledge', 'chatbot', 'ecommerce', 'appointments',
    'analytics', 'tickets', 'integrations', 'agents', 'clients', 'marketing', 'setup', 'reports'
  ],
  leadStatuses: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
  campaignTypes: ['bulk', 'drip'],
  messageTypes: ['text', 'image', 'video', 'audio', 'document', 'template', 'interactive'],
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
// LOGGER (Must be defined before any module uses it)
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
// GLOBAL HELPER FUNCTIONS (Must be before any module uses them)
// ============================================================
function getCurrentClientId() {
  return window.currentUser?.clientId || null;
}

function shouldFilterByClient() {
  const user = window.currentUser;
  if (!user) return false;
  if (user.role === 'platform_owner' || user.role === 'platform_super_admin' || user.role === 'admin') return false;
  return !!user.clientId;
}

function getCurrentUserRole() {
  return window.currentUser?.role || 'client';
}

function isPlatformAdmin() {
  const role = getCurrentUserRole();
  return role === 'platform_owner' || role === 'platform_super_admin' || role === 'admin';
}

function isClientUser() {
  return !!getCurrentClientId() && !isPlatformAdmin();
}

function getCurrentPlanLimits() {
  const plan = window.currentUser?.plan || 'free';
  return PLATFORM_CONFIG.limits[plan + 'Plan'] || PLATFORM_CONFIG.limits.freePlan;
}

function formatCurrency(amount) {
  return '₹' + (parseInt(amount) || 0).toLocaleString('en-IN');
}

function formatDate(date) {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(date) {
  if (!date) return '-';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function truncateText(text, length = 50) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function generateId(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(name) {
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6','#6366f1','#8b5cf6','#d946ef','#f43f5e','#f97316'];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
  return colors[Math.abs(hash) % colors.length];
}

function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showToast(message, type = 'success') {
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
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:99999;background:${c.bg};border:1px solid ${c.border};color:${c.text};padding:12px 20px;border-radius:12px;font-size:14px;font-weight:500;display:flex;align-items:center;gap:8px;box-shadow:0 10px 30px rgba(0,0,0,0.1);max-width:400px;`;
  toast.innerHTML = `<i class="fas ${c.icon}" style="font-size:18px;"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100px)'; toast.style.transition = 'all 0.3s ease'; setTimeout(() => toast.remove(), 300); }, 4000);
}

// ============================================================
// ERROR HANDLING
// ============================================================
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', function(event) {
  console.error('Global error:', event.error);
});

// ============================================================
// INITIALIZATION LOG
// ============================================================
Logger.info('Firebase initialized successfully');
Logger.info('Platform: ' + PLATFORM_CONFIG.platformName + ' v' + PLATFORM_CONFIG.platformVersion);
Logger.info('Environment: ' + (window.location.hostname === 'localhost' ? 'Development' : 'Production'));

window.PLATFORM_CONFIG = PLATFORM_CONFIG;
window.DEFAULT_ROLES = DEFAULT_ROLES;
