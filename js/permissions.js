// js/permissions.js — Role‑Based Access Control Engine

// 1. DEFAULT ROLE DEFINITIONS (platform owner override kar sakta hai)
const DEFAULT_ROLES = {
  platform_owner: {
    name: 'Platform Owner',
    level: 0,
    isPlatformRole: true,
    modules: {
      dashboard: { read: true },
      leads: { create: true, read: true, update: true, delete: true, export: true },
      contacts: { create: true, read: true, update: true, delete: true, import: true, export: true },
      campaigns: { create: true, read: true, update: true, delete: true },
      templates: { create: true, read: true, update: true, delete: true, sync: true },
      chats: { read: true, send: true },
      flows: { create: true, read: true, update: true, delete: true },
      chatbot: { configure: true, read: true },
      setup: { read: true, write: true },
      integrations: { read: true, write: true },
      agents: { create: true, read: true, update: true, delete: true },
      clients: { create: true, read: true, update: true, delete: true },  // means platform clients
      kanban: { create: true, read: true, update: true, delete: true },
      social: { read: true, post: true, schedule: true },
      marketing: { read: true, manage: true },
      forms: { create: true, read: true, update: true, delete: true },
      ecommerce: { read: true, manage: true },
      tickets: { create: true, read: true, update: true, delete: true },
      appointments: { create: true, read: true, update: true, delete: true },
      analytics: { read: true },
      reports: { read: true, export: true },
      plan: { read: true, upgrade: true },
      knowledge: { read: true, manage: true },
      admin: { read: true, manage: true },  // special admin panel
    },
    special: ['billing','server','domain','smtp','api_keys','backup','logs','white_label']
  },

  platform_super_admin: {
    name: 'Platform Super Admin',
    level: 1,
    isPlatformRole: true,
    modules: { /* same as owner but without delete permissions on some critical parts */
      dashboard: { read: true },
      leads: { create: true, read: true, update: true, delete: true, export: true },
      contacts: { create: true, read: true, update: true, delete: true, import: true, export: true },
      campaigns: { create: true, read: true, update: true, delete: true },
      templates: { create: true, read: true, update: true, delete: true, sync: true },
      chats: { read: true, send: true },
      flows: { create: true, read: true, update: true, delete: true },
      chatbot: { configure: true, read: true },
      setup: { read: true, write: true },
      integrations: { read: true, write: true },
      agents: { create: true, read: true, update: true, delete: true },
      clients: { read: true, update: true },  // can't delete
      kanban: { create: true, read: true, update: true, delete: true },
      social: { read: true, post: true },
      marketing: { read: true },
      forms: { create: true, read: true, update: true, delete: true },
      ecommerce: { read: true },
      tickets: { create: true, read: true, update: true, delete: true },
      appointments: { create: true, read: true, update: true, delete: true },
      analytics: { read: true },
      reports: { read: true, export: true },
      plan: { read: true },
      knowledge: { read: true },
      admin: { read: true },
    },
    special: []
  },

  client_owner: {
    name: 'Client Company Owner',
    level: 2,
    isPlatformRole: false,
    modules: {
      // By default full access to all modules that are enabled in client's plan
      // Actual permissions will be intersected with plan modules
    },
    special: ['manage_company_roles']
  },

  client_admin: {
    name: 'Company Admin',
    level: 3,
    modules: {},
    special: ['manage_department_roles']
  },

  manager: {
    name: 'Manager',
    level: 4,
    modules: {}
  },

  executive: {
    name: 'Executive',
    level: 5,
    modules: {}
  }
};

// 2. PERMISSION UTILITIES
window.Permissions = {
  // Load from Firestore or fallback to defaults
  async loadRolePermissions(roleId) {
    // Later we can fetch from 'roles' collection; for now use hardcoded
    const defaultRole = DEFAULT_ROLES[roleId];
    if (!defaultRole) return null;

    // Check if client has custom role overrides stored in Firestore
    const clientId = window.currentUser?.clientId;
    if (clientId) {
      try {
        const snap = await db.collection('clients').doc(clientId).collection('roles').doc(roleId).get();
        if (snap.exists) {
          // Merge with default
          return { ...defaultRole, ...snap.data() };
        }
      } catch(e) {}
    }
    return defaultRole;
  },

  // Get effective permissions for current user
  async getEffectivePermissions() {
    const user = window.currentUser;
    if (!user) return {};

    const role = await this.loadRolePermissions(user.role);
    if (!role) return {};

    // If client user, intersect with plan modules
    if (!role.isPlatformRole && user.clientId) {
      const clientDoc = await db.collection('clients').doc(user.clientId).get();
      const clientData = clientDoc.data() || {};
      const planModules = clientData.modules || [];
      
      // Only keep modules that are in the plan
      const allowedModules = {};
      Object.keys(role.modules || {}).forEach(mod => {
        if (planModules.includes(mod)) {
          allowedModules[mod] = role.modules[mod];
        }
      });
      role.modules = allowedModules;
    }

    // User-level overrides
    if (user.permissions) {
      role.modules = { ...role.modules, ...user.permissions };
    }

    return role;
  },

  // Simple check: can user perform action on module?
  canAccess(module, action = 'read') {
    const perms = window.__currentPermissions;
    if (!perms) return false;

    // Platform owner/super admin can do everything
    if (perms.isPlatformRole && (perms.level === 0 || perms.level === 1)) return true;

    const modPerms = perms.modules?.[module];
    if (!modPerms) return false;

    return modPerms[action] === true;
  }
};
