// js/permissions.js — Role‑Based Access Control Engine (Working)

const DEFAULT_ROLES = {
  // 1. PLATFORM OWNER
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
      clients: { create: true, read: true, update: true, delete: true },
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
      admin: { read: true, manage: true },
      profile: { read: true, update: true }
    },
    special: ['billing','server','domain','smtp','api_keys','backup','logs','white_label']
  },

  // 2. PLATFORM SUPER ADMIN
  platform_super_admin: {
    name: 'Platform Super Admin',
    level: 1,
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
      clients: { read: true, update: true },
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
      admin: { read: true, manage: true },
      profile: { read: true, update: true }
    },
    special: []
  },

  // 3. CLIENT COMPANY OWNER
  client_owner: {
    name: 'Client Company Owner',
    level: 2,
    isPlatformRole: false,
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
      clients: { create: true, read: true, update: true, delete: true },
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
      admin: { read: true },
      profile: { read: true, update: true }
    },
    special: ['manage_company_roles']
  },

  // 4. CLIENT ADMIN
  client_admin: {
    name: 'Company Admin',
    level: 3,
    isPlatformRole: false,
    modules: {
      dashboard: { read: true },
      leads: { create: true, read: true, update: true, delete: true, export: true },
      contacts: { create: true, read: true, update: true, delete: true, import: true, export: true },
      campaigns: { create: true, read: true, update: true, delete: true },
      templates: { create: true, read: true, update: true, delete: true, sync: true },
      chats: { read: true, send: true },
      flows: { create: true, read: true, update: true, delete: true },
      chatbot: { configure: true, read: true },
      integrations: { read: true },
      agents: { read: true },
      kanban: { create: true, read: true, update: true, delete: true },
      social: { read: true, post: true },
      marketing: { read: true },
      forms: { create: true, read: true, update: true, delete: true },
      ecommerce: { read: true },
      tickets: { create: true, read: true, update: true, delete: true },
      appointments: { create: true, read: true, update: true, delete: true },
      analytics: { read: true },
      reports: { read: true },
      plan: { read: true },
      knowledge: { read: true },
      admin: { read: true },
      profile: { read: true, update: true }
    },
    special: ['manage_department_roles']
  },

  // 5. MANAGER
  manager: {
    name: 'Manager',
    level: 4,
    isPlatformRole: false,
    modules: {
      dashboard: { read: true },
      leads: { create: true, read: true, update: true, delete: true },
      contacts: { read: true, update: true },
      campaigns: { read: true },
      chats: { read: true, send: true },
      kanban: { read: true, update: true },
      appointments: { create: true, read: true, update: true },
      analytics: { read: true },
      reports: { read: true },
      profile: { read: true, update: true }
    },
    special: []
  },

  // 6. EXECUTIVE
  executive: {
    name: 'Executive',
    level: 5,
    isPlatformRole: false,
    modules: {
      dashboard: { read: true },
      leads: { create: true, read: true, update: true },
      contacts: { read: true },
      chats: { read: true, send: true },
      appointments: { read: true },
      profile: { read: true, update: true }
    },
    special: []
  }
};

// Old to new role mapping (backward compatibility)
const ROLE_MAP = {
  'admin': 'platform_owner',
  'team': 'client_admin',
  'client': 'executive'
};

window.Permissions = {
  async getEffectivePermissions() {
    const user = window.currentUser;
    // If no user, return a safe minimal permission set
    if (!user) return DEFAULT_ROLES.platform_owner;

    // Resolve role ID (old → new)
    let roleId = user.role;
    if (!DEFAULT_ROLES[roleId]) {
      roleId = ROLE_MAP[roleId] || 'platform_owner';
    }

    // Get the role definition (clone it to avoid modifying the original)
    const role = JSON.parse(JSON.stringify(DEFAULT_ROLES[roleId] || DEFAULT_ROLES.platform_owner));

    // If client user, intersect with plan modules
    if (!role.isPlatformRole && user.clientId) {
      try {
        const clientDoc = await db.collection('clients').doc(user.clientId).get();
        const clientData = clientDoc.data() || {};
        const planModules = clientData.modules || [];

        if (planModules.length > 0) {
          const allowedModules = {};
          Object.keys(role.modules).forEach(mod => {
            if (planModules.includes(mod)) {
              allowedModules[mod] = role.modules[mod];
            }
          });
          role.modules = allowedModules;
        }
      } catch (e) {
        console.warn('Could not fetch client plan, using full role permissions.', e);
      }
    }

    // Apply user-level overrides (if any)
    if (user.permissions) {
      Object.assign(role.modules, user.permissions);
    }

    return role;
  },

  canAccess(module, action = 'read') {
    const perms = window.__currentPermissions;
    // If permissions are still loading, allow everything (prevents blank header)
    if (!perms) return true;

    // Platform Owner and Super Admin have full access
    if (perms.isPlatformRole && (perms.level === 0 || perms.level === 1)) return true;

    // Check specific module permission
    const modPerms = perms.modules?.[module];
    if (!modPerms) return false;

    return modPerms[action] === true;
  }
};
