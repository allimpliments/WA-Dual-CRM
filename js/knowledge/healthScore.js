// js/knowledge/healthScore.js — Multi-Step Business Diagnostic Wizard
(function(Knowledge, contentArea, db, firebase) {
  let step = 1;
  let answers = {};

  const questions = [
    {
      step: 1,
      title: 'Lead Generation Health',
      question: 'How would you rate your current lead generation system?',
      options: [
        { value: 5, label: 'Excellent — Multi-channel automated system', icon: 'fa-star' },
        { value: 4, label: 'Good — Few channels, semi-automated', icon: 'fa-check-circle' },
        { value: 3, label: 'Average — Manual processes, inconsistent', icon: 'fa-minus-circle' },
        { value: 2, label: 'Poor — No structured system', icon: 'fa-exclamation-circle' },
        { value: 1, label: 'Nonexistent — Starting from scratch', icon: 'fa-question-circle' }
      ]
    },
    {
      step: 2,
      title: 'Customer Communication',
      question: 'What is your average response time to customer inquiries?',
      options: [
        { value: 5, label: 'Under 1 minute — Instant automation', icon: 'fa-bolt' },
        { value: 4, label: '1-5 minutes — Quick manual responses', icon: 'fa-clock' },
        { value: 3, label: '5-30 minutes — Acceptable delays', icon: 'fa-hourglass-half' },
        { value: 2, label: '1-4 hours — Significant delays', icon: 'fa-hourglass-end' },
        { value: 1, label: '24+ hours — Major gap', icon: 'fa-calendar-times' }
      ]
    },
    {
      step: 3,
      title: 'Sales Automation',
      question: 'How automated is your sales follow-up process?',
      options: [
        { value: 5, label: 'Fully automated — Drip sequences + chatbot', icon: 'fa-robot' },
        { value: 4, label: 'Partially automated — Some sequences setup', icon: 'fa-cogs' },
        { value: 3, label: 'Basic automation — Template responses only', icon: 'fa-copy' },
        { value: 2, label: 'Manual — Team handles everything', icon: 'fa-user' },
        { value: 1, label: 'No follow-up system', icon: 'fa-times' }
      ]
    },
    {
      step: 4,
      title: 'Customer Retention',
      question: 'What retention strategies do you currently use?',
      options: [
        { value: 5, label: 'Comprehensive — Loyalty + re-engagement + NPS', icon: 'fa-heart' },
        { value: 4, label: 'Multiple — Regular campaigns + feedback', icon: 'fa-thumbs-up' },
        { value: 3, label: 'Basic — Occasional promotional messages', icon: 'fa-bell' },
        { value: 2, label: 'Minimal — Rarely engage existing customers', icon: 'fa-volume-off' },
        { value: 1, label: 'None — No retention strategy', icon: 'fa-heart-broken' }
      ]
    },
    {
      step: 5,
      title: 'Technology Stack',
      question: 'What technology do you use for business communication?',
      options: [
        { value: 5, label: 'WhatsApp API + CRM + Full automation stack', icon: 'fa-layer-group' },
        { value: 4, label: 'WhatsApp API with basic automation', icon: 'fa-plug' },
        { value: 3, label: 'WhatsApp Business App +
