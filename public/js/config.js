// public/js/config.js — Global state & config

const ATX = {
  ADMIN_PASSWORD: '782447',

  // State
  currentUser:   JSON.parse(sessionStorage.getItem('atx_user') || 'null'),
  adminUnlocked: sessionStorage.getItem('atx_admin') === '1',
  currentFilter: 'all',
  allContent:    { movies: [], series: [] },
  epCounter:     0,
  authMode:      'login',
};
