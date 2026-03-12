// public/js/config.js — Global state & config

const ATX = {
  // FIX: पासवर्ड यहाँ से हटा दिया गया है। 
  // अब यह सिर्फ आपके टाइप करने पर मेमोरी में आएगा और Koyeb के .env से चेक होगा।
  ADMIN_PASSWORD: '',

  // User State
  currentUser: JSON.parse(sessionStorage.getItem('atx_user') || 'null'),

  /* FIX: adminUnlocked को हमेशा 'false' रखा है।
     इससे जब भी आप लोगो पर क्लिक करेंगे, सिस्टम आपसे नया पासवर्ड मांगेगा।
  */
  adminUnlocked: false,

  currentFilter: 'all',
  allContent:    { movies: [], series: [] },
  epCounter:     0,
  authMode:      'login',
};
