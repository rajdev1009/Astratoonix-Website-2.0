// public/js/config.js — Global state & config

const ATX = {
  // यह चाबी बैकएंड के ADMIN_PASSWORD से मैच होनी चाहिए
  ADMIN_PASSWORD: '782447',

  // User State
  currentUser: JSON.parse(sessionStorage.getItem('atx_user') || 'null'),

  /* FIX: adminUnlocked को हमेशा 'false' रखा है।
     इससे जब भी आप लोगो पर क्लिक करेंगे, सिस्टम आपसे नया पासवर्ड मांगेगा।
     sessionStorage का इस्तेमाल यहाँ बंद कर दिया गया है ताकि सुरक्षा बनी रहे।
  */
  adminUnlocked: false,

  currentFilter: 'all',
  allContent:    { movies: [], series: [] },
  epCounter:     0,
  authMode:      'login',
};
