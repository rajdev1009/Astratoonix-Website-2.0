// public/js/content.js — Grid, filter, search

async function loadContent() {
  try {
    const d = await API.get('/api/content');
    ATX.allContent = d;
    renderGrid();
  } catch (e) { notify('Failed to load content', 'error'); }
}

function renderGrid(movies, series) {
  const mv = movies  !== undefined ? movies  : ATX.allContent.movies;
  const sr = series  !== undefined ? series  : ATX.allContent.series;

  let items = [];
  if      (ATX.currentFilter === 'all')    items = [...mv.map(m => ({...m,_type:'movie'})), ...sr.map(s => ({...s,_type:'series'}))];
  else if (ATX.currentFilter === 'movie')  items = mv.map(m => ({...m,_type:'movie'}));
  else if (ATX.currentFilter === 'series') items = sr.map(s => ({...s,_type:'series'}));

  const grid = document.getElementById('combined-grid');
  if (!items.length) {
    const lbl = ATX.currentFilter==='movie' ? 'No movies found' : ATX.currentFilter==='series' ? 'No series found' : 'No content yet';
    grid.innerHTML = `<div class="empty-state"><div class="icon">🎞</div><p>${lbl}</p></div>`;
    return;
  }
  grid.innerHTML = items.map(cardHTML).join('');
}

function cardHTML(item) {
  const t      = item._type || item.type || 'movie';
  const hasVIP = item.isPremium || (item.episodes && item.episodes.some(e => e.isPremium));
  return `<div class="card${item.isHidden?' hidden-content':''}" onclick="openPlayer('${item._id}','${t}')">
    <img src="${item.poster}" alt="${item.title}" onerror="this.src='https://placehold.co/300x450/0d0d0d/ff0033?text=No+Image'"/>
    ${hasVIP ? '<div class="vip-badge">⭐ VIP</div>' : ''}
    ${item.isHidden ? '<div class="hidden-badge">HIDDEN</div>' : ''}
    <div class="card-info">
      <div class="card-title">${item.title}</div>
      <div class="card-type-badge ${t}">${t==='movie'?'🎬 Movie':'📺 Series'}</div>
    </div>
  </div>`;
}

function filterContent(type, btn) {
  ATX.currentFilter = type;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const q = document.getElementById('search-input').value.trim();
  if (q) handleSearch(q); else renderGrid();
}

let _st;
function handleSearch(q) {
  clearTimeout(_st);
  if (!q.trim()) { renderGrid(); return; }
  _st = setTimeout(async () => {
    try {
      const d = await API.get('/api/content/search?q=' + encodeURIComponent(q));
      renderGrid(d.movies, d.series);
    } catch (e) {}
  }, 300);
}
