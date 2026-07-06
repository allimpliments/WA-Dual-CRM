// js/permissions.js
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
    }
  }
};

window.Permissions = {
  async getEffectivePermissions() {
    const user = window.currentUser;
    if (!user) return {};
    // For now, return default role permissions
    return DEFAULT_ROLES[user.role] || DEFAULT_ROLES['platform_owner'];
  },

  canAccess(module, action = 'read') {
    const perms = window.__currentPermissions;
    // If permissions not loaded yet, allow everything (temporary)
    if (!perms) return true;
    if (perms.isPlatformRole && perms.level <= 1) return true;
    return perms.modules?.[module]?.[action] === true;
  }
};
