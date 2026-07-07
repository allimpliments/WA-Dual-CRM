// js/permissions.js — Role‑Based Access Control Engine (Updated with Pending User Check)

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
    // यदि कोई user नहीं (fallback) — platform owner दे दें (सिर्फ सेफ्टी के लिए)
    if (!user) return DEFAULT_ROLES.platform_owner;

    // 🚫 PENDING USER — अप्रूवल से पहले कोई एक्सेस नहीं
    if (user.status === 'pending') {
      return { modules: {}, isPlatformRole: false, level: 99 };
    }

    // Resolve role ID (old → new)
    let roleId = user.role;
    if (!DEFAULT_ROLES[roleId]) {
      roleId = ROLE_MAP[roleId] || 'platform_owner';
    }

    // रोल डेफिनिशन की कॉपी बनाएँ (मूल ऑब्जेक्ट को न छेड़ें)
    const role = JSON.parse(JSON.stringify(DEFAULT_ROLES[roleId] || DEFAULT_ROLES.platform_owner));

    // यदि क्लाइंट यूज़र है, तो उसकी कंपनी को असाइन किए गए मॉड्यूल के अनुसार फ़िल्टर करें
    if (!role.isPlatformRole && user.clientId) {
      try {
        const clientDoc = await db.collection('clients').doc(user.clientId).get();
        const clientData = clientDoc.data() || {};
        const clientModules = clientData.modules || [];

        if (clientModules.length > 0) {
          const allowedModules = {};
          Object.keys(role.modules).forEach(mod => {
            if (clientModules.includes(mod)) {
              allowedModules[mod] = role.modules[mod];
            }
          });
          role.modules = allowedModules;
        }
      } catch (e) {
        console.warn('Could not fetch client plan, using full role permissions.', e);
      }
    }

    // यूज़र-लेवल परमिशन ओवरराइड (यदि एडमिन ने users डॉक्यूमेंट में permissions डाली हैं)
    if (user.permissions) {
      Object.keys(user.permissions).forEach(mod => {
        if (role.modules[mod]) {
          // पहले से मौजूद मॉड्यूल के एक्शन मर्ज करें
          Object.assign(role.modules[mod], user.permissions[mod]);
        } else {
          // नया मॉड्यूल ऐड करें
          role.modules[mod] = user.permissions[mod];
        }
      });
    }

    return role;
  },

  canAccess(module, action = 'read') {
    const perms = window.__currentPermissions;
    // लोडिंग के दौरान (permissions अभी सेट नहीं हुई) — एक्सेस दें ताकि UI टूटे नहीं
    if (!perms) return true;

    // प्लेटफ़ॉर्म ओनर और सुपर एडमिन को हर जगह पूरा एक्सेस
    if (perms.isPlatformRole && (perms.level === 0 || perms.level === 1)) return true;

    // पेंडिंग यूज़र (level 99) — किसी भी मॉड्यूल का एक्सेस नहीं
    if (perms.level === 99) return false;

    const modPerms = perms.modules?.[module];
    if (!modPerms) return false;

    return modPerms[action] === true;
  }
};
