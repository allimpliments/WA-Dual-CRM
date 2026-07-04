// Lead Capture Engine — Centralized Lead Creation
const LeadCapture = {
  // Main function to capture lead from any source
  async capture(data) {
    const lead = {
      name: data.name || 'Unknown',
      phone: data.phone || '',
      email: data.email || '',
      source: data.source || 'Unknown',
      status: 'new',
      tags: data.tags || [],
      customData: data.customData || {},
      campaignId: data.campaignId || null,
      adId: data.adId || null,
      formId: data.formId || null,
      pageUrl: data.pageUrl || '',
      utmSource: data.utmSource || '',
      utmMedium: data.utmMedium || '',
      utmCampaign: data.utmCampaign || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore
    const docRef = await db.collection('leads').add(lead);
    
    // Also save to Contacts if phone/email exists
    if (lead.phone || lead.email) {
      await this.syncToContacts(lead);
    }

    return docRef.id;
  },

  // Sync lead to contacts collection
  async syncToContacts(lead) {
    const existing = await db.collection('contacts')
      .where('mobile', '==', lead.phone)
      .where('email', '==', lead.email)
      .get();
    
    if (existing.empty) {
      await db.collection('contacts').add({
        firstName: lead.name.split(' ')[0] || '',
        lastName: lead.name.split(' ').slice(1).join(' ') || '',
        mobile: lead.phone,
        email: lead.email,
        source: lead.source,
        status: 'new',
        tags: lead.tags,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  },

  // ========== SOURCE-SPECIFIC CAPTURE FUNCTIONS ==========

  // 1. Manual Entry (from Leads Tab)
  async fromManual(name, phone, email, source) {
    return this.capture({ name, phone, email, source: source || 'Manual' });
  },

  // 2. From Contact Form Submission
  async fromForm(formData, formId) {
    return this.capture({
      name: formData.name || formData.fullName || formData.firstName,
      phone: formData.phone || formData.mobile,
      email: formData.email,
      source: 'Form',
      formId: formId,
      customData: formData
    });
  },

  // 3. From WhatsApp Message
  async fromWhatsApp(phone, message, contactName) {
    return this.capture({
      name: contactName || 'WhatsApp Lead',
      phone: phone,
      source: 'WhatsApp',
      customData: { message: message }
    });
  },

  // 4. From Facebook Lead Ads Webhook
  async fromFacebookAd(adData) {
    return this.capture({
      name: adData.full_name || adData.first_name + ' ' + adData.last_name,
      phone: adData.phone_number || '',
      email: adData.email || '',
      source: 'Facebook',
      adId: adData.ad_id,
      campaignId: adData.campaign_id,
      customData: adData
    });
  },

  // 5. From Instagram DM
  async fromInstagram(igUserId, message, username) {
    return this.capture({
      name: username || 'Instagram Lead',
      phone: '',
      email: '',
      source: 'Instagram',
      customData: { instagramId: igUserId, message: message }
    });
  },

  // 6. From Website Widget
  async fromWebsite(widgetData) {
    return this.capture({
      name: widgetData.name,
      phone: widgetData.phone,
      email: widgetData.email,
      source: 'Website',
      pageUrl: widgetData.pageUrl || window.location.href,
      utmSource: widgetData.utmSource || '',
      utmMedium: widgetData.utmMedium || '',
      utmCampaign: widgetData.utmCampaign || ''
    });
  },

  // 7. From Google Ads
  async fromGoogleAds(gclid, adData) {
    return this.capture({
      name: adData.name || 'Google Ads Lead',
      phone: adData.phone || '',
      email: adData.email || '',
      source: 'Google Ads',
      customData: { gclid: gclid, ...adData }
    });
  },

  // 8. From Campaign (Bulk WhatsApp)
  async fromCampaign(phone, name, campaignId) {
    return this.capture({
      name: name || 'Campaign Lead',
      phone: phone,
      source: 'Campaign',
      campaignId: campaignId
    });
  },

  // 9. From E-commerce Order
  async fromEcommerce(orderData) {
    return this.capture({
      name: orderData.customerName || orderData.billing_name,
      phone: orderData.phone || orderData.billing_phone,
      email: orderData.email || orderData.billing_email,
      source: 'E-commerce',
      customData: { orderId: orderData.orderId, amount: orderData.total }
    });
  },

  // 10. From Social Media Comments
  async fromSocialMedia(platform, userData, comment) {
    return this.capture({
      name: userData.name || userData.username,
      phone: userData.phone || '',
      email: userData.email || '',
      source: platform,
      customData: { comment: comment, platformId: userData.id }
    });
  }
};
