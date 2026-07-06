// js/i18n.js — Multi‑Language Engine (15+ Indian Languages)
const I18n = {
  currentLang: 'en',
  translations: {
    en: {
      // Header & Navigation
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
      logout: 'Logout',
      more: 'More',
      welcome: 'Welcome back,',
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
      // Admin
      platform_admin: 'Platform Administration',
      company_settings: 'Company Settings',
      admin_dashboard: 'Dashboard',
      admin_clients: 'Clients',
      admin_users: 'Users',
      admin_roles: 'Roles & Permissions',
      admin_plans: 'Plans',
      admin_settings: 'Settings',
      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      loading: 'Loading...',
      no_data: 'No data',
      coming_soon: 'Coming soon',
      back: 'Back',
      submit: 'Submit',
    },
    hi: {
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
      logout: 'लॉग आउट',
      more: 'अधिक',
      welcome: 'वापसी पर स्वागत है,',
      total_leads: 'कुल लीड्स',
      total_contacts: 'कुल संपर्क',
      won_deals: 'जीते गए सौदे',
      pipeline_value: 'पाइपलाइन मूल्य',
      recent_leads: 'हाल की लीड्स',
      add_lead: 'लीड जोड़ें',
      add_contact: 'संपर्क जोड़ें',
      new_campaign: 'नया अभियान',
      open_pipeline: 'पाइपलाइन खोलें',
      platform_admin: 'प्लेटफ़ॉर्म प्रशासन',
      company_settings: 'कंपनी सेटिंग्स',
      admin_dashboard: 'डैशबोर्ड',
      admin_clients: 'ग्राहक',
      admin_users: 'उपयोगकर्ता',
      admin_roles: 'भूमिकाएं और अनुमतियाँ',
      admin_plans: 'योजनाएं',
      admin_settings: 'सेटिंग्स',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      create: 'बनाएं',
      search: 'खोजें',
      loading: 'लोड हो रहा है...',
      no_data: 'कोई डेटा नहीं',
      coming_soon: 'जल्द ही आ रहा है',
      back: 'वापस',
      submit: 'जमा करें',
    },
    // (Add more languages: bn, te, mr, ta, ur, gu, kn, ml, or, pa, as, mai, hinglish)
    // For brevity, we show only two; in practice you'd generate all.
  },

  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('pref_lang', lang);
      // Save to Firestore for logged-in user
      if (window.currentUser && window.currentUser.uid) {
        db.collection('users').doc(window.currentUser.uid).update({ language: lang }).catch(()=>{});
      }
      // Reload current section to apply translations
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

  // Initialize language from user setting or localStorage
  async init() {
    // First, check localStorage
    let lang = localStorage.getItem('pref_lang');
    // If user is logged in, prefer their saved language
    if (window.currentUser && window.currentUser.language) {
      lang = window.currentUser.language;
    }
    if (lang && this.translations[lang]) {
      this.currentLang = lang;
    }
    // Set the language selector dropdown if present
    const selector = document.getElementById('langSelector');
    if (selector) selector.value = this.currentLang;
  }
};

// Auto‑initialize when script loads
document.addEventListener('DOMContentLoaded', () => I18n.init());
