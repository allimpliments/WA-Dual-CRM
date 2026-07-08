// js/permissions.js — Advanced Role‑Based Access Control Engine for SaaS Platform
// ============================================================
// DEFAULT ROLE DEFINITIONS
// ============================================================
const DEFAULT_ROLES = {
  // 1. PLATFORM OWNER — Full access to everything
  platform_owner: {
    name: 'Platform Owner',
    level: 0,
    isPlatformRole: true,
    description: 'Full access to all platform features, billing, and settings',
    modules: {
      dashboard: { read: true },
      leads: { create: true, read: true, update: true, delete: true, export: true, assign: true },
      contacts: { create: true, read: true, update: true, delete: true, import: true, export: true },
      campaigns: { create: true, read: true, update: true, delete: true, execute: true },
      templates: { create: true, read: true, update: true, delete: true, sync: true, submit: true },
      chats: { read: true, send: true, delete: true, export: true },
      flows: { create: true, read: true, update: true, delete: true, publish: true },
      chatbot: { configure: true, read: true, train: true, deploy: true },
      setup: { read: true, write: true, delete: true },
      integrations: { read: true, write: true, delete: true },
      agents: { create: true, read: true, update: true, delete: true, invite: true },
      clients: { create: true, read: true, update: true, delete: true, approve: true },
      kanban: { create: true, read: true, update: true, delete: true, move: true },
      social: { read: true, post: true, schedule: true, delete: true, comment: true },
      marketing: { read: true, manage: true, create: true, delete: true },
      forms: { create: true, read: true, update: true, delete: true, publish: true },
      ecommerce: { read: true, manage: true, create: true, delete: true },
      tickets: { create: true, read: true, update: true, delete: true, resolve: true },
      appointments: { create: true, read: true, update: true, delete: true, confirm: true },
      analytics: { read: true, export: true, filter: true },
      reports: { read: true, export: true, schedule: true, create: true },
      plan: { read: true, upgrade: true, manage: true },
      knowledge: { read: true, manage: true, create: true, delete: true },
      admin: { read: true, manage: true, configure: true },
      profile: { read: true, update: true }
    },
    special: ['billing', 'server', 'domain', 'smtp', 'api_keys', 'backup', 'logs', 'white_label', 'custom_css', 'custom_js', 'audit_logs']
  },

  // 2. PLATFORM SUPER ADMIN — Almost full access, limited billing
  platform_super_admin: {
    name: 'Platform Super Admin',
    level: 1,
    isPlatformRole: true,
    description: 'Full access except billing and critical platform settings',
    modules: {
      dashboard: { read: true },
      leads: { create: true, read: true, update: true, delete: true, export: true, assign: true },
      contacts: { create: true, read: true, update: true, delete: true, import: true, export: true },
      campaigns: { create: true, read: true, update: true, delete: true, execute: true },
      templates: { create: true, read: true, update: true, delete: true, sync: true, submit: true },
      chats: { read: true, send: true, delete: true, export: true },
      flows: { create: true, read: true, update: true, delete: true, publish: true },
      chatbot: { configure: true, read: true, train: true, deploy: true },
      setup: { read: true, write: true, delete: true },
      integrations: { read: true, write: true, delete: true },
      agents: { create: true, read: true, update: true, delete: true, invite: true },
      clients: { read: true, update: true, approve: true },
      kanban: { create: true, read: true, update: true, delete: true, move: true },
      social: { read: true, post: true, schedule: true, delete: true, comment: true },
      marketing: { read: true, manage: true, create: true },
      forms: { create: true, read: true, update: true, delete: true, publish: true },
      ecommerce: { read: true, manage: true },
      tickets: { create: true, read: true, update: true, delete: true, resolve: true },
      appointments: { create: true, read: true, update: true, delete: true, confirm: true },
      analytics: { read: true, export: true, filter: true },
      reports: { read: true, export: true, schedule: true, create: true },
      plan: { read: true, upgrade: true },
      knowledge: { read: true, manage: true, create: true, delete: true },
      admin: { read: true, manage: true, configure: true },
      profile: { read: true, update: true }
    },
    special: ['audit_logs', 'api_keys']
  },

  // 3. CLIENT COMPANY OWNER — Full access within their company
  client_owner: {
    name: 'Client Company Owner',
    level: 2,
    isPlatformRole: false,
    description: 'Full access to all company features and team management',
    modules: {
      dashboard: { read: true },
      leads: { create: true, read: true, update: true, delete: true, export: true, assign: true },
      contacts: { create: true, read: true, update: true, delete: true, import: true, export: true },
      campaigns: { create: true, read: true, update: true, delete: true, execute: true },
      templates: { create: true, read: true, update: true, delete: true, sync: true, submit: true },
      chats: { read: true, send: true },
      flows: { create: true, read: true, update: true, delete: true, publish: true },
      chatbot: { configure: true, read: true, train: true },
      setup: { read: true, write: true },
      integrations: { read: true, write: true },
      agents: { create: true, read: true, update: true, delete: true, invite: true },
      clients: { create: true, read: true, update: true, delete: true },
      kanban: { create: true, read: true, update: true, delete: true, move: true },
      social: { read: true, post: true, schedule: true, delete: true, comment: true },
      marketing: { read: true, manage: true, create: true },
      forms: { create: true, read: true, update: true, delete: true, publish: true },
      ecommerce: { read: true, manage: true, create: true },
      tickets: { create: true, read: true, update: true, delete: true, resolve: true },
      appointments: { create: true, read: true, update: true, delete: true, confirm: true },
      analytics: { read: true, export: true },
      reports: { read: true, export: true, create: true },
      plan: { read: true, upgrade: true },
      knowledge: { read: true, manage: true, create: true },
      admin: { read: true },
      profile: { read: true, update: true }
    },
    special: ['manage_company_roles', 'manage_company_settings', 'view_billing']
  },

  // 4. CLIENT ADMIN — Administrative access within company
  client_admin: {
    name: 'Company Admin',
    level: 3,
    isPlatformRole: false,
    description: 'Administrative access to manage team and operations',
    modules: {
      dashboard: { read: true },
      leads: { create: true, read: true, update: true, delete: true, export: true, assign: true },
      contacts: { create: true, read: true, update: true, delete: true, import: true, export: true },
      campaigns: { create: true, read: true, update: true, delete: true, execute: true },
      templates: { create: true, read: true, update: true, delete: true, sync: true, submit: true },
      chats: { read: true, send: true },
      flows: { create: true, read: true, update: true, delete: true, publish: true },
      chatbot: { configure: true, read: true },
      setup: { read: true, write: true },
      integrations: { read: true },
      agents: { read: true, update: true, invite: true },
      kanban: { create: true, read: true, update: true, delete: true, move: true },
      social: { read: true, post: true, schedule: true, comment: true },
      marketing: { read: true, manage: true, create: true },
      forms: { create: true, read: true, update: true, delete: true, publish: true },
      ecommerce: { read: true, manage: true },
      tickets: { create: true, read: true, update: true, delete: true, resolve: true },
      appointments: { create: true, read: true, update: true, delete: true, confirm: true },
      analytics: { read: true, export: true },
      reports: { read: true, export: true, create: true },
      plan: { read: true },
      knowledge: { read: true, manage: true, create: true },
      admin: { read: true },
      profile: { read: true, update: true }
    },
    special: ['manage_department_roles', 'view_team_reports']
  },

  // 5. MANAGER — Team management and lead handling
  manager: {
    name: 'Manager',
    level: 4,
    isPlatformRole: false,
    description: 'Team management with limited administrative access',
    modules: {
      dashboard: { read: true },
      leads: { create: true, read: true, update: true, delete: true, assign: true },
      contacts: { create: true, read: true, update: true, import: true },
      campaigns: { read: true, execute: true },
      chats: { read: true, send: true },
      kanban: { create: true, read: true, update: true, delete: true, move: true },
      appointments: { create: true, read: true, update: true },
      analytics: { read: true },
      reports: { read: true },
      tickets: { create: true, read: true, update: true },
      knowledge: { read: true },
      profile: { read: true, update: true }
    },
    special: ['view_team_leads', 'assign_tasks']
  },

  // 6. EXECUTIVE — Basic lead and contact management
  executive: {
    name: 'Executive',
    level: 5,
    isPlatformRole: false,
    description: 'Basic access for lead management and communication',
    modules: {
      dashboard: { read: true },
      leads: { create: true, read: true, update: true },
      contacts: { read: true, create: true },
      chats: { read: true, send: true },
      appointments: { read: true, create: true },
      tickets: { read: true, create: true },
      knowledge: { read: true },
      profile: { read: true, update: true }
    },
    special: []
  },

  // 7. VIEWER — Read-only access
  viewer: {
    name: 'Viewer',
    level: 6,
    isPlatformRole: false,
    description: 'Read-only access to dashboards and reports',
    modules: {
      dashboard: { read: true },
      leads: { read: true },
      contacts: { read: true },
      analytics: { read: true },
      reports: { read: true },
      profile: { read: true }
    },
    special: []
  }
};

// ============================================================
// ROLE MAPPING (Backward Compatibility)
// ============================================================
const ROLE_MAP = {
  'admin': 'platform_owner',
  'super_admin': 'platform_super_admin',
  'team': 'client_admin',
  'client': 'executive',
  'user': 'executive',
  'member': 'executive'
};

// ============================================================
// PERMISSION STATUS CONSTANTS
// ============================================================
const PERM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive'
};

const RESTRICTED_LEVEL = 99;

// ============================================================
// PERMISSIONS ENGINE
// ============================================================
window.Permissions = {
  /**
   * Get effective permissions for current user
   * Combines: Role permissions + Client modules + User overrides
   * @returns {object} Effective permissions object
   */
  async getEffectivePermissions() {
    const user = window.currentUser;
    
    // No user — return safe default (platform owner for safety)
    if (!user) {
      Logger.warn('No current user, returning default permissions');
      return DEFAULT_ROLES.platform_owner;
    }

    // ====== STATUS-BASED RESTRICTIONS ======
    
    // Pending user — no access
    if (user.status === PERM_STATUS.PENDING) {
      Logger.info(`User ${user.email} is pending — no access granted`);
      return { modules: {}, isPlatformRole: false, level: RESTRICTED_LEVEL, status: 'pending' };
    }

    // Rejected user — no access
    if (user.status === PERM_STATUS.REJECTED) {
      Logger.info(`User ${user.email} is rejected — no access granted`);
      return { modules: {}, isPlatformRole: false, level: RESTRICTED_LEVEL, status: 'rejected' };
    }

    // Suspended user — no access
    if (user.status === PERM_STATUS.SUSPENDED) {
      Logger.info(`User ${user.email} is suspended — no access granted`);
      return { modules: {}, isPlatformRole: false, level: RESTRICTED_LEVEL, status: 'suspended' };
    }

    // Inactive user — no access
    if (user.status === PERM_STATUS.INACTIVE) {
      Logger.info(`User ${user.email} is inactive — no access granted`);
      return { modules: {}, isPlatformRole: false, level: RESTRICTED_LEVEL, status: 'inactive' };
    }

    // ====== ROLE RESOLUTION ======
    
    // Resolve role ID (handle old role names)
    let roleId = user.role;
    if (!DEFAULT_ROLES[roleId]) {
      const mappedRole = ROLE_MAP[roleId];
      if (mappedRole) {
        Logger.info(`Role "${roleId}" mapped to "${mappedRole}"`);
        roleId = mappedRole;
      } else {
        Logger.warn(`Unknown role "${roleId}", defaulting to platform_owner`);
        roleId = 'platform_owner';
      }
    }

    // Get the role definition (deep clone to avoid mutation)
    const roleDefinition = DEFAULT_ROLES[roleId] || DEFAULT_ROLES.platform_owner;
    const role = JSON.parse(JSON.stringify(roleDefinition));

    // Add role metadata
    role.roleId = roleId;
    role.roleName = role.name;

    // ====== CLIENT MODULE FILTERING ======
    
    // If user is a client user (not platform role), filter by assigned modules
    if (!role.isPlatformRole && user.clientId) {
      try {
        const clientDoc = await db.collection('clients').doc(user.clientId).get();
        
        if (!clientDoc.exists) {
          Logger.warn(`Client document not found for clientId: ${user.clientId}`);
          // Return empty modules if client doc doesn't exist
          role.modules = {};
          return role;
        }

        const clientData = clientDoc.data();
        
        // Check client status
        if (clientData.status && clientData.status !== 'approved') {
          Logger.info(`Client ${user.clientId} status is "${clientData.status}" — restricting access`);
          role.modules = { dashboard: { read: true } }; // Minimal access
          return role;
        }

        const clientModules = clientData.modules || [];

        // ✅ FIX: ALWAYS intersect with client modules
        // Even if empty, result should be empty (only dashboard)
        const allowedModules = {};
        if (clientModules.length > 0) {
          let restrictedCount = 0;
          
          Object.keys(role.modules).forEach(mod => {
            if (clientModules.includes(mod)) {
              allowedModules[mod] = role.modules[mod];
            } else {
              restrictedCount++;
            }
          });
          
          role.modules = allowedModules;
          Logger.info(`Client module filter: ${Object.keys(allowedModules).length} allowed, ${restrictedCount} restricted`);
        } else {
          // ✅ FIX: No client modules assigned → give ONLY dashboard
          Logger.info('No client modules assigned — restricting to dashboard only');
          role.modules = { dashboard: { read: true } };
        }
      } catch (e) {
        Logger.error('Error fetching client plan for permission filtering', e);
        // ✅ FIX: On error, give minimal access
        role.modules = { dashboard: { read: true } };
      }
    }

    // ====== USER-LEVEL PERMISSION OVERRIDES ======
    
    // If admin has set specific permissions on user document, apply them
    if (user.permissions && typeof user.permissions === 'object') {
      const overrideCount = Object.keys(user.permissions).length;
      
      if (overrideCount > 0) {
        Object.keys(user.permissions).forEach(mod => {
          if (role.modules[mod]) {
            // Merge with existing module permissions
            Object.assign(role.modules[mod], user.permissions[mod]);
          } else {
            // Add new module permission
            role.modules[mod] = user.permissions[mod];
          }
        });
        
        Logger.info(`Applied ${overrideCount} user-level permission overrides`);
      }
    }

    // ====== PLAN-BASED LIMITS ======
    
    // Add plan info to permissions
    role.plan = user.plan || 'free';
    role.planLimits = PLATFORM_CONFIG.limits[role.plan + 'Plan'] || PLATFORM_CONFIG.limits.freePlan;

    // Cache the permissions for this session
    this._cachedPermissions = role;
    this._cacheTime = Date.now();

    return role;
  },

  /**
   * Check if current user can access a specific module with a specific action
   * @param {string} module - Module name (e.g., 'leads', 'contacts')
   * @param {string} action - Action name (e.g., 'read', 'create', 'update', 'delete')
   * @returns {boolean} Whether access is granted
   */
  canAccess(module, action = 'read') {
    const perms = window.__currentPermissions;

    // If permissions are still loading, allow access temporarily (prevents UI flicker)
    if (!perms) {
      return true;
    }

    // Platform Owner (level 0) and Super Admin (level 1) have full access to everything
    if (perms.isPlatformRole && (perms.level === 0 || perms.level === 1)) {
      return true;
    }

    // Restricted users (pending, rejected, suspended, inactive) — no access
    if (perms.level === RESTRICTED_LEVEL) {
      return false;
    }

    // Check specific module permission
    const modPerms = perms.modules?.[module];
    if (!modPerms) {
      return false;
    }

    // Check specific action permission
    // 'read' is the default minimum — if module is accessible, read is always granted
    if (action === 'read' && Object.keys(modPerms).length > 0) {
      return true;
    }

    return modPerms[action] === true;
  },

  /**
   * Check if user has any of the specified actions on a module
   * @param {string} module - Module name
   * @param {string[]} actions - Array of action names
   * @returns {boolean} Whether any action is granted
   */
  canAccessAny(module, actions) {
    return actions.some(action => this.canAccess(module, action));
  },

  /**
   * Check if user has all of the specified actions on a module
   * @param {string} module - Module name
   * @param {string[]} actions - Array of action names
   * @returns {boolean} Whether all actions are granted
   */
  canAccessAll(module, actions) {
    return actions.every(action => this.canAccess(module, action));
  },

  /**
   * Get list of modules the current user can access
   * @returns {string[]} Array of module names
   */
  getAccessibleModules() {
    const perms = window.__currentPermissions;
    if (!perms || !perms.modules) return [];
    return Object.keys(perms.modules);
  },

  /**
   * Check if current user is platform admin
   * @returns {boolean}
   */
  isPlatformAdmin() {
    const perms = window.__currentPermissions;
    if (!perms) return false;
    return perms.isPlatformRole && (perms.level === 0 || perms.level === 1);
  },

  /**
   * Check if current user is client user
   * @returns {boolean}
   */
  isClientUser() {
    const perms = window.__currentPermissions;
    if (!perms) return false;
    return !perms.isPlatformRole;
  },

  /**
   * Get user's current role name
   * @returns {string}
   */
  getCurrentRoleName() {
    const perms = window.__currentPermissions;
    if (!perms) return 'Unknown';
    return perms.roleName || perms.name || 'Unknown';
  },

  /**
   * Get user's current role level
   * @returns {number}
   */
  getCurrentRoleLevel() {
    const perms = window.__currentPermissions;
    if (!perms) return 99;
    return perms.level || 99;
  },

  /**
   * Invalidate cached permissions (force reload on next check)
   */
  invalidateCache() {
    this._cachedPermissions = null;
    this._cacheTime = null;
    Logger.info('Permissions cache invalidated');
  },

  /**
   * Get cached permissions (if available and fresh)
   * @returns {object|null}
   */
  getCachedPermissions() {
    if (this._cachedPermissions && this._cacheTime) {
      const age = Date.now() - this._cacheTime;
      // Cache valid for 5 minutes
      if (age < 5 * 60 * 1000) {
        return this._cachedPermissions;
      }
    }
    return null;
  },

  // Private cache
  _cachedPermissions: null,
  _cacheTime: null
};

// ============================================================
// EXPORT FOR USE IN OTHER MODULES
// ============================================================
Logger.info('Permissions engine initialized with ' + Object.keys(DEFAULT_ROLES).length + ' roles');
