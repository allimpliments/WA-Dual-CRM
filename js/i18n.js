// js/i18n.js — Full Platform Translation Engine
const I18n = {
  currentLang: 'en',
  translations: {
    en: {
      // Header & Navigation
      more: 'More',
      logout: 'Logout',
      dashboard: 'Dashboard',
      leads: 'Leads',
      contacts: 'Contacts',
      campaigns: 'Campaigns',
      templates: 'Templates',
      chats: 'Chats',
      flows: 'Flows',
      social: 'Social',
      marketing: 'Marketing',
      ecommerce: 'E‑commerce',
      appointments: 'Appointments',
      knowledge: 'Knowledge Engine',
      chatbot: 'Chatbot',
      forms: 'Forms',
      integrations: 'Integrations',
      agents: 'Agents',
      clients: 'Clients',
      analytics: 'Analytics',
      reports: 'Reports',
      setup: 'Setup',
      tickets: 'Tickets',
      plan: 'My Plan',
      profile: 'My Profile',
      admin: 'Admin',

      // Dashboard
      total_leads: 'Total Leads',
      total_contacts: 'Total Contacts',
      won_deals: 'Won Deals',
      pipeline_value: 'Pipeline Value',
      recent_leads: 'Recent Leads',
      add_lead: 'Add Lead',
      add_contact: 'Add Contact',
      new_campaign: 'New Campaign',
      open_pipeline: 'Open Pipeline',
      welcome_back: 'Welcome back,',
      whatsapp_connected: 'WhatsApp Connected & Ready',
      whatsapp_not_configured: 'WhatsApp not configured. Go to Setup.',
      lead_sources: 'Lead Sources',
      no_leads_yet: 'No leads yet.',
      view_all: 'View All',

      // Common actions
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search...',
      loading: 'Loading...',
      no_data: 'No data',
      coming_soon: 'Coming soon',
      back: 'Back',
      submit: 'Submit',
      send: 'Send',
      refresh: 'Refresh',
      export: 'Export',
      import: 'Import',
      filter: 'Filter',
      clear: 'Clear',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',

      // Leads
      lead_management: 'Lead Management',
      add_lead_btn: 'Add Lead',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      source: 'Source',
      status: 'Status',
      actions: 'Actions',
      new_lead: 'New Lead',
      contacted: 'Contacted',
      qualified: 'Qualified',
      proposal: 'Proposal',
      negotiation: 'Negotiation',
      won: 'Won',
      lost: 'Lost',

      // Contacts
      contact_management: 'Contact Management',
      add_contact_btn: 'Add Contact',
      first_name: 'First Name',
      last_name: 'Last Name',
      mobile: 'Mobile',
      group: 'Group',
      import_csv: 'Import CSV',
      export_csv: 'Export CSV',
      manage_groups: 'Manage Groups',
      custom_fields: 'Custom Fields',

      // Campaigns
      campaign_management: 'Campaign Management',
      new_bulk_campaign: 'New Bulk Campaign',
      drip_sequences: 'Drip Sequences',
      bulk_campaigns: 'Bulk Campaigns',
      sent: 'Sent',
      delivered: 'Delivered',
      failed: 'Failed',
      schedule: 'Schedule',
      message: 'Message',

      // Admin
      platform_admin: 'Platform Administration',
      company_settings: 'Company Settings',
      admin_dashboard: 'Dashboard',
      admin_clients: 'Clients',
      admin_users: 'Users',
      admin_roles: 'Roles & Permissions',
      admin_plans: 'Plans',
      admin_settings: 'Settings',
      user_management: 'User Management',
      role_management: 'Role Management',
      subscription_plans: 'Subscription Plans',
      company_profile: 'Company Profile',
      preferences: 'Preferences',
      pipeline: 'Pipeline',
      manage_columns: 'Manage Columns',
      custom_properties: 'Custom Properties',
      notifications: 'Notifications',
      automatic_reports: 'Automatic Reports',
      notification_preferences: 'Notification Preferences',
      frequency: 'Frequency',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      send_via_email: 'Send via Email',
      send_via_whatsapp: 'Send via WhatsApp',
    },
    hi: {
      // Header & Navigation
      more: 'अधिक',
      logout: 'लॉग आउट',
      dashboard: 'डैशबोर्ड',
      leads: 'लीड्स',
      contacts: 'संपर्क',
      campaigns: 'अभियान',
      templates: 'टेम्पलेट',
      chats: 'चैट',
      flows: 'फ़्लो',
      social: 'सोशल',
      marketing: 'मार्केटिंग',
      ecommerce: 'ई‑कॉमर्स',
      appointments: 'अपॉइंटमेंट',
      knowledge: 'नॉलेज इंजन',
      chatbot: 'चैटबॉट',
      forms: 'फ़ॉर्म',
      integrations: 'इंटीग्रेशन',
      agents: 'एजेंट',
      clients: 'क्लाइंट',
      analytics: 'एनालिटिक्स',
      reports: 'रिपोर्ट',
      setup: 'सेटअप',
      tickets: 'टिकट',
      plan: 'मेरा प्लान',
      profile: 'मेरी प्रोफ़ाइल',
      admin: 'एडमिन',

      // Dashboard
      total_leads: 'कुल लीड्स',
      total_contacts: 'कुल संपर्क',
      won_deals: 'जीते गए सौदे',
      pipeline_value: 'पाइपलाइन मूल्य',
      recent_leads: 'हाल की लीड्स',
      add_lead: 'लीड जोड़ें',
      add_contact: 'संपर्क जोड़ें',
      new_campaign: 'नया अभियान',
      open_pipeline: 'पाइपलाइन खोलें',
      welcome_back: 'वापसी पर स्वागत है,',
      whatsapp_connected: 'व्हाट्सएप कनेक्टेड और तैयार',
      whatsapp_not_configured: 'व्हाट्सएप सेटअप नहीं है। सेटअप में जाएं।',
      lead_sources: 'लीड स्रोत',
      no_leads_yet: 'अभी तक कोई लीड नहीं।',
      view_all: 'सभी देखें',

      // Common actions
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      create: 'बनाएं',
      search: 'खोजें...',
      loading: 'लोड हो रहा है...',
      no_data: 'कोई डेटा नहीं',
      coming_soon: 'जल्द ही आ रहा है',
      back: 'वापस',
      submit: 'जमा करें',
      send: 'भेजें',
      refresh: 'रीफ्रेश',
      export: 'एक्सपोर्ट',
      import: 'इम्पोर्ट',
      filter: 'फ़िल्टर',
      clear: 'साफ करें',
      confirm: 'पुष्टि करें',
      yes: 'हाँ',
      no: 'नहीं',

      // Leads
      lead_management: 'लीड प्रबंधन',
      add_lead_btn: 'लीड जोड़ें',
      name: 'नाम',
      phone: 'फ़ोन',
      email: 'ईमेल',
      source: 'स्रोत',
      status: 'स्थिति',
      actions: 'कार्रवाई',
      new_lead: 'नई लीड',
      contacted: 'संपर्क किया',
      qualified: 'योग्य',
      proposal: 'प्रस्ताव',
      negotiation: 'बातचीत',
      won: 'जीता',
      lost: 'हारा',

      // Contacts
      contact_management: 'संपर्क प्रबंधन',
      add_contact_btn: 'संपर्क जोड़ें',
      first_name: 'पहला नाम',
      last_name: 'अंतिम नाम',
      mobile: 'मोबाइल',
      group: 'समूह',
      import_csv: 'CSV आयात करें',
      export_csv: 'CSV निर्यात करें',
      manage_groups: 'समूह प्रबंधित करें',
      custom_fields: 'कस्टम फ़ील्ड्स',

      // Campaigns
      campaign_management: 'अभियान प्रबंधन',
      new_bulk_campaign: 'नया बल्क अभियान',
      drip_sequences: 'ड्रिप सीक्वेंस',
      bulk_campaigns: 'बल्क अभियान',
      sent: 'भेजा गया',
      delivered: 'डिलीवर हुआ',
      failed: 'असफल',
      schedule: 'शेड्यूल',
      message: 'संदेश',

      // Admin
      platform_admin: 'प्लेटफ़ॉर्म प्रशासन',
      company_settings: 'कंपनी सेटिंग्स',
      admin_dashboard: 'डैशबोर्ड',
      admin_clients: 'ग्राहक',
      admin_users: 'उपयोगकर्ता',
      admin_roles: 'भूमिकाएं और अनुमतियाँ',
      admin_plans: 'योजनाएं',
      admin_settings: 'सेटिंग्स',
      user_management: 'उपयोगकर्ता प्रबंधन',
      role_management: 'भूमिका प्रबंधन',
      subscription_plans: 'सदस्यता योजनाएं',
      company_profile: 'कंपनी प्रोफ़ाइल',
      preferences: 'प्राथमिकताएं',
      pipeline: 'पाइपलाइन',
      manage_columns: 'कॉलम प्रबंधित करें',
      custom_properties: 'कस्टम गुण',
      notifications: 'सूचनाएं',
      automatic_reports: 'स्वचालित रिपोर्ट',
      notification_preferences: 'अधिसूचना प्राथमिकताएं',
      frequency: 'आवृत्ति',
      daily: 'दैनिक',
      weekly: 'साप्ताहिक',
      monthly: 'मासिक',
      send_via_email: 'ईमेल से भेजें',
      send_via_whatsapp: 'व्हाट्सएप से भेजें',
    }
    // (baaki languages aap yahan add kar sakte hain)
  },

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('pref_lang', lang);
      if (window.currentUser?.uid) {
        db.collection('users').doc(window.currentUser.uid).update({ language: lang }).catch(()=>{});
      }
      // Re‑render current section
      if (typeof loadSection === 'function') {
        const current = window._currentSection || 'dashboard';
        loadSection(current);
      }
    }
  },

  t(key) {
    return this.translations[this.currentLang]?.[key] || 
           this.translations['en']?.[key] || 
           key;
  },

  init() {
    let lang = localStorage.getItem('pref_lang');
    if (window.currentUser?.language) lang = window.currentUser.language;
    if (lang && this.translations[lang]) this.currentLang = lang;
    const selector = document.getElementById('langSelector');
    if (selector) selector.value = this.currentLang;
  }
};
