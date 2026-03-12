// public/js/admin.js — Full Admin Panel v3

// ── UNLOCK ──────────────────────────────────────────────────────
function openAdminPass() {
  // ATX.adminUnlocked चेक हटा दिया है ताकि हर बार बॉक्स खुले
  document.getElementById('ap-input').value = '';
  document.getElementById('ap-msg').textContent = '';
  openModal('admin-pass-modal');
  setTimeout(() => document.getElementById('ap-input').focus(), 100);
}

// FIX: Backend से पासवर्ड वेरीफाई करना
async function checkAdminPass() {
  const val = document.getElementById('ap-input').value.trim();
  const btn = document.querySelector('#admin-pass-modal .btn-red');
  const msg = document.getElementById('ap-msg');

  if (!val) { msg.textContent = '❌ Please enter password'; return; }

  btn.textContent = 'Checking...'; btn.disabled = true;
  
  // Backend को पासवर्ड भेजें चेक करने के लिए (dummy request to check token)
  try {
    const res = await fetch('/api/users', { 
      headers: { 'Content-Type': 'application/json', 'x-admin-token': val } 
    });
    
    if (res.ok) {
      // पासवर्ड सही है
      ATX.ADMIN_PASSWORD = val; // API कॉल्स के लिए चाबी सेट कर दी
      ATX.adminUnlocked = true;
      closeModal('admin-pass-modal');
      openAdminPanel();
    } else {
      msg.textContent = '❌ Wrong password. Access denied.';
    }
  } catch (e) {
    msg.textContent = '❌ Server error. Try again.';
  } finally {
    btn.textContent = 'UNLOCK PANEL'; btn.disabled = false;
  }
}

function openAdminPanel() {
  document.getElementById('admin-panel').classList.add('active');
  switchTab('tab-content', document.querySelector('.tab-btn.first'));
}

function closeAdmin() { 
  document.getElementById('admin-panel').classList.remove('active'); 
  // FIX: पैनल बंद करते ही एडमिन लॉक और चाबी डिलीट
  ATX.adminUnlocked = false;
  ATX.ADMIN_PASSWORD = ''; 
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (btn) btn.classList.add('active');
  if (tabId === 'tab-content')   loadContentTable();
  if (tabId === 'tab-users')     loadUserTable();
  if (tabId === 'tab-analytics') loadAnalytics();
}

// ══════════════════════════════════════════════════════
//   A. CONTENT MANAGER
// ══════════════════════════════════════════════════════

// ── Episode builder ──────────────────────────────────
function addEpisode() {
  ATX.epCounter++;
  const n    = ATX.epCounter;
  const list = document.getElementById('ep-list');
  const div  = document.createElement('div');
  div.className = 'ep-card';
  div.id        = 'ep-card-' + n;
  
  // FIX: यहाँ Title और Poster दोनों का इनपुट बॉक्स जोड़ा गया है
  div.innerHTML = `
    <div class="ep-card-header">
      <span class="ep-num">Episode #${n}</span>
      <button class="btn-remove-ep" onclick="removeEpisode(${n})">✕ Remove</button>
    </div>
    <div class="form-row" style="margin-bottom:8px;">
      <div class="form-field">
        <label>📝 Episode Title (Optional)</label>
        <input type="text" id="e${n}-title" placeholder="e.g. The Beginning"/>
      </div>
      <div class="form-field">
        <label>🖼 Poster URL</label>
        <input type="text" id="e${n}-poster" placeholder="https://..."/>
      </div>
    </div>
    <div class="quality-grid">
      <div class="form-field"><label>480p</label><input type="text" id="e${n}-480"  placeholder="https://..."/></div>
      <div class="form-field"><label>720p</label><input type="text" id="e${n}-720"  placeholder="https://..."/></div>
      <div class="form-field"><label>1080p</label><input type="text" id="e${n}-1080" placeholder="https://..."/></div>
      <div class="form-field"><label>4K</label><input type="text"   id="e${n}-4k"   placeholder="https://..."/></div>
    </div>
    <div class="toggle-wrap">
      <label class="toggle"><input type="checkbox" id="e${n}-premium"/><span class="slider"></span></label>
      <span style="font-size:13px;letter-spacing:1px;">Premium Episode</span>
    </div>`;
  list.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function removeEpisode(n) { document.getElementById('ep-card-' + n)?.remove(); }

// ── Save Movie ───────────────────────────────────────
async function saveMovie() {
  const body = {
    title:     document.getElementById('m-title').value.trim(),
    poster:    document.getElementById('m-poster').value.trim(),
    backdrop:  document.getElementById('m-backdrop').value.trim(),
    isPremium: document.getElementById('m-premium').checked,
    links: {
      p480:  document.getElementById('m-480').value.trim(),
      p720:  document.getElementById('m-720').value.trim(),
      p1080: document.getElementById('m-1080').value.trim(),
      p4k:   document.getElementById('m-4k').value.trim()
    }
  };
  if (!body.title || !body.poster) { notify('Title and Poster URL required', 'error'); return; }
  const btn = document.getElementById('save-movie-btn');
  btn.textContent = 'Saving...'; btn.disabled = true;
  try {
    const d = await API.adminPost('/api/content/movies', body);
    if (d.error) { notify(d.error, 'error'); return; }
    notify('✅ Movie saved & live!', 'success');
    ['m-title','m-poster','m-backdrop','m-480','m-720','m-1080','m-4k'].forEach(id => document.getElementById(id).value='');
    document.getElementById('m-premium').checked = false;
    loadContent();
    loadContentTable();
  } catch (e) { notify('Save failed', 'error'); }
  finally { btn.textContent = '💾 SAVE MOVIE'; btn.disabled = false; }
}

// ── Save Series ──────────────────────────────────────
async function saveSeries() {
  const title  = document.getElementById('s-title').value.trim();
  const poster = document.getElementById('s-poster').value.trim();
  if (!title || !poster) { notify('Title and Poster required', 'error'); return; }

  const cards    = document.querySelectorAll('.ep-card');
  const episodes = [];
  cards.forEach((card, i) => {
    const n = card.id.replace('ep-card-', '');
    // FIX: यहाँ title को भी सेव करने का कोड डाला गया है
    episodes.push({
      number:    i + 1,
      title:     document.getElementById('e'+n+'-title')?.value.trim()  || '',
      poster:    document.getElementById('e'+n+'-poster')?.value.trim() || '',
      isPremium: document.getElementById('e'+n+'-premium')?.checked     || false,
      links: {
        p480:  document.getElementById('e'+n+'-480')?.value.trim()  || '',
        p720:  document.getElementById('e'+n+'-720')?.value.trim()  || '',
        p1080: document.getElementById('e'+n+'-1080')?.value.trim() || '',
        p4k:   document.getElementById('e'+n+'-4k')?.value.trim()   || ''
      }
    });
  });

  const btn = document.getElementById('save-series-btn');
  btn.textContent = 'Saving...'; btn.disabled = true;
  try {
    const d = await API.adminPost('/api/content/series', { title, poster, episodes });
    if (d.error) { notify(d.error, 'error'); return; }
    notify('✅ Series saved & live!', 'success');
    document.getElementById('s-title').value  = '';
    document.getElementById('s-poster').value = '';
    document.getElementById('ep-list').innerHTML = '';
    ATX.epCounter = 0;
    loadContent();
    loadContentTable();
  } catch (e) { notify('Save failed', 'error'); }
  finally { btn.textContent = '💾 SAVE SERIES'; btn.disabled = false; }
}

// ── Content Table (manage existing) ──────────────────
async function loadContentTable() {
  const el = document.getElementById('content-table');
  el.innerHTML = '<p style="color:var(--muted);font-size:13px;">Loading...</p>';
  try {
    const d = await API.adminGet('/api/content');
    const all = [
      ...d.movies.map(m => ({...m,_t:'movie'})),
      ...d.series.map(s => ({...s,_t:'series'}))
    ];
    if (!all.length) { el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No content yet.</p>'; return; }
    el.innerHTML = all.map(item => `
      <div class="ct-item${item.isHidden?' is-hidden':''}" id="cti-${item._id}">
        <img class="ct-thumb" src="${item.poster}" onerror="this.src='https://placehold.co/32x47/111/ff0033?text=?'" alt=""/>
        <div class="ct-info">
          <div class="ct-title">${item.title}</div>
          <div class="ct-meta">${item._t==='movie'?'🎬 Movie':'📺 Series'} ${item.isHidden?'· 👁 Hidden':''} ${item.isPremium?'· ⭐ Premium':''}</div>
        </div>
        <div class="ct-actions">
          <button class="btn-sm btn-edit" onclick="openEditModal('${item._id}','${item._t}','${encodeURIComponent(item.title)}','${encodeURIComponent(item.poster)}')">✏ Edit</button>
          <button class="btn-sm btn-hide" onclick="toggleHide('${item._id}','${item._t}',this)">${item.isHidden?'👁 Show':'👁 Hide'}</button>
          <button class="btn-sm btn-del"  onclick="deleteContent('${item._id}','${item._t}')">🗑 Delete</button>
        </div>
      </div>`).join('');
  } catch (e) { el.innerHTML = '<p style="color:var(--muted);">Error loading</p>'; }
}

async function toggleHide(id, type, btn) {
  const url = `/api/content/${type === 'movie' ? 'movies' : 'series'}/${id}/hide`;
  const d   = await API.adminPatch(url);
  if (d.error) { notify(d.error, 'error'); return; }
  btn.textContent = d.isHidden ? '👁 Show' : '👁 Hide';
  const row = document.getElementById('cti-' + id);
  if (row) row.classList.toggle('is-hidden', d.isHidden);
  notify(d.isHidden ? 'Content hidden' : 'Content visible', 'success');
  loadContent();
}

async function deleteContent(id, type) {
  if (!confirm('Delete this ' + type + '? This cannot be undone.')) return;
  const url = `/api/content/${type === 'movie' ? 'movies' : 'series'}/${id}`;
  const d   = await API.adminDelete(url);
  if (d.error) { notify(d.error, 'error'); return; }
  document.getElementById('cti-' + id)?.remove();
  notify('✅ Deleted!', 'success');
  loadContent();
}

// ── Edit Modal ────────────────────────────────────────
function openEditModal(id, type, titleEnc, posterEnc) {
  document.getElementById('edit-id').value    = id;
  document.getElementById('edit-type').value  = type;
  document.getElementById('edit-title').value  = decodeURIComponent(titleEnc);
  document.getElementById('edit-poster').value = decodeURIComponent(posterEnc);
  document.getElementById('edit-msg').textContent = '';
  openModal('edit-modal');
}

async function saveEdit() {
  const id    = document.getElementById('edit-id').value;
  const type  = document.getElementById('edit-type').value;
  const title  = document.getElementById('edit-title').value.trim();
  const poster = document.getElementById('edit-poster').value.trim();
  if (!title || !poster) { notify('Title and Poster required', 'error'); return; }

  const url = `/api/content/${type === 'movie' ? 'movies' : 'series'}/${id}`;
  const d   = await API.adminPatch(url, { title, poster });
  if (d.error) { notify(d.error, 'error'); return; }
  notify('✅ Updated!', 'success');
  closeModal('edit-modal');
  loadContent();
  loadContentTable();
}

// ══════════════════════════════════════════════════════
//   B + C. USER MANAGEMENT
// ══════════════════════════════════════════════════════

async function loadUserTable() {
  const el = document.getElementById('user-table');
  el.innerHTML = '<p style="color:var(--muted);font-size:13px;">Loading...</p>';
  try {
    const d = await API.adminGet('/api/users');
    if (!d.users?.length) { el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No users yet.</p>'; return; }

    // Stats
    const vip     = d.users.filter(u => u.status === 'lifetime' || u.status === 'active').length;
    const blocked = d.users.filter(u => u.isBlocked).length;
    const trial   = d.users.filter(u => u.isTrial).length;
    const expired = d.users.filter(u => u.status === 'expired').length;
    document.getElementById('stat-total').textContent   = d.users.length;
    document.getElementById('stat-vip').textContent     = vip;
    document.getElementById('stat-blocked').textContent = blocked;
    document.getElementById('stat-expired').textContent = expired;

    el.innerHTML = d.users.map(u => `
      <div class="u-item${u.isBlocked?' blocked':''}" id="ui-${u._id}">
        <div style="flex:1;min-width:0;">
          <div class="u-email">${u.email}</div>
          <div style="margin-top:3px;">
            ${getStatusBadge(u.status, u.planExpiry)}
            ${u.vipGrantedAt ? `<span style="font-size:10px;color:var(--muted);margin-left:5px;">Since ${new Date(u.vipGrantedAt).toLocaleDateString()}</span>` : ''}
          </div>
        </div>
        <div class="u-actions">
          <input type="number" class="u-days-input" id="days-${u._id}" value="30" min="1" max="365" title="Days"/>
          <button class="btn-vip-days"  onclick="grantDays('${u._id}')">⭐ Days</button>
          <button class="btn-lifetime"  onclick="grantLifetime('${u._id}')">♾ Lifetime</button>
          <button class="btn-revoke"    onclick="revokeVIP('${u._id}')">Revoke</button>
          <button class="btn-trial"     onclick="setTrial('${u._id}')">Trial</button>
          <button class="btn-block${u.isBlocked?' blocked':''}" onclick="toggleBlock('${u._id}',this)">${u.isBlocked?'Unblock':'Block'}</button>
        </div>
      </div>`).join('');
  } catch (e) { el.innerHTML = '<p style="color:var(--muted);">Error</p>'; }
}

// Grant VIP by email (quick form at top)
async function grantByEmail() {
  const email = document.getElementById('vip-email').value.trim();
  const type  = document.getElementById('vip-type').value;
  const days  = parseInt(document.getElementById('vip-days').value) || 30;
  const msg   = document.getElementById('vip-email-msg');
  if (!email) { msg.style.color='#ff4466'; msg.textContent='Email daalo!'; return; }

  const url  = type === 'lifetime' ? '/api/users/grant-lifetime' : '/api/users/grant-days';
  const body = type === 'lifetime' ? { email } : { email, days };
  const d    = await API.adminPatch(url, body);
  if (d.error) { msg.style.color='#ff4466'; msg.textContent=d.error; return; }

  msg.style.color = '#00ff88';
  msg.textContent = type === 'lifetime' ? `✅ Lifetime VIP: ${email}` : `✅ ${days}-day VIP: ${email}`;
  document.getElementById('vip-email').value = '';
  notify('⭐ VIP granted: ' + email, 'success');
  loadUserTable();
}

async function grantDays(id) {
  const days = parseInt(document.getElementById('days-' + id).value) || 30;
  const d    = await API.adminPatch(`/api/users/${id}/grant-days`, { days });
  if (d.error) { notify(d.error, 'error'); return; }
  notify(`✅ ${days}-day VIP granted!`, 'success');
  loadUserTable();
}

async function grantLifetime(id) {
  const d = await API.adminPatch(`/api/users/${id}/grant-lifetime`);
  if (d.error) { notify(d.error, 'error'); return; }
  notify('♾ Lifetime VIP granted!', 'success');
  loadUserTable();
}

async function revokeVIP(id) {
  const d = await API.adminPatch(`/api/users/revoke/${id}`);
  if (d.error) { notify(d.error, 'error'); return; }
  notify('VIP revoked', 'success');
  loadUserTable();
}

async function setTrial(id) {
  const d = await API.adminPatch(`/api/users/${id}/trial`);
  if (d.error) { notify(d.error, 'error'); return; }
  notify('Trial access set', 'info');
  loadUserTable();
}

async function toggleBlock(id, btn) {
  const d = await API.adminPatch(`/api/users/${id}/block`);
  if (d.error) { notify(d.error, 'error'); return; }
  btn.textContent = d.isBlocked ? 'Unblock' : 'Block';
  btn.classList.toggle('blocked', d.isBlocked);
  document.getElementById('ui-' + id)?.classList.toggle('blocked', d.isBlocked);
  notify(d.isBlocked ? '🔴 User blocked' : '✅ User unblocked');
  loadUserTable();
}

// ── Master Reset (3-step) ────────────────────────────
function openResetModal() {
  ['r-pass1','r-pass2','r-confirm'].forEach(id => document.getElementById(id).value='');
  document.getElementById('r-msg').textContent='';
  openModal('reset-modal');
}

async function doMasterReset() {
  const pass1 = document.getElementById('r-pass1').value.trim();
  const pass2 = document.getElementById('r-pass2').value.trim();
  const conf  = document.getElementById('r-confirm').value.trim();
  const msg   = document.getElementById('r-msg');

  if (!pass1||!pass2||!conf) { msg.style.color='#ff4466'; msg.textContent='Sab fields bharo!'; return; }

  const d = await API.adminDelete('/api/users/reset-all', {
    pass1, pass2, confirmText: conf
  });
  if (d.error) { msg.style.color='#ff4466'; msg.textContent='❌ '+d.error; return; }

  ATX.currentUser = null;
  sessionStorage.removeItem('atx_user');
  updateUserBar();
  closeModal('reset-modal');
  notify('✅ All users wiped!', 'success');
  loadUserTable();
}

// ══════════════════════════════════════════════════════
//   D. ANALYTICS
// ══════════════════════════════════════════════════════

async function loadAnalytics() {
  const el = document.getElementById('search-log-grid');
  el.innerHTML = '<p style="color:var(--muted);font-size:13px;">Loading...</p>';
  try {
    const d = await API.adminGet('/api/analytics/searches');
    if (!d.logs?.length) { el.innerHTML = '<p style="color:var(--muted);font-size:13px;">No searches yet.</p>'; return; }
    el.innerHTML = d.logs.map(l => `
      <div class="search-log-item" id="sl-${l._id}">
        <div>
          <div class="sl-query">🔍 ${l.query}</div>
          <div style="font-size:10px;color:var(--muted);margin-top:2px;">${new Date(l.lastSearched).toLocaleDateString()}</div>
        </div>
        <span class="sl-count">${l.count}x</span>
        <button class="sl-del" onclick="deleteSearchLog('${l._id}')" title="Delete">✕</button>
      </div>`).join('');
  } catch (e) { el.innerHTML = '<p style="color:var(--muted);">Error</p>'; }
}

async function deleteSearchLog(id) {
  await API.adminDelete('/api/analytics/searches/' + id);
  document.getElementById('sl-' + id)?.remove();
}

async function clearAllSearchLogs() {
  if (!confirm('Clear all search history?')) return;
  await API.adminDelete('/api/analytics/searches');
  loadAnalytics();
  notify('Search history cleared');
}
