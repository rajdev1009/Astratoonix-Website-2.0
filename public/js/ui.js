// public/js/ui.js — Modals, notifications, ads

function openModal(id)  { document.getElementById(id)?.classList.add('active'); }

// FIX: प्लेयर बंद होते ही वीडियो को पूरी तरह रोक (Clear) दें
function closeModal(id) { 
  document.getElementById(id)?.classList.remove('active'); 
  
  // अगर प्लेयर वाला डिब्बा बंद हुआ है, तो अंदर का HTML (वीडियो) साफ कर दो ताकि बैकग्राउंड आवाज़ बंद हो जाए
  if (id === 'player-modal') {
    const playerInner = document.getElementById('player-inner');
    if (playerInner) playerInner.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) closeModal(o.id); });
  });
});

let _nTimer;
function notify(msg, type = '') {
  const el = document.getElementById('notify');
  el.textContent = msg;
  el.className   = 'notify show ' + type;
  clearTimeout(_nTimer);
  _nTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

function initAds() {
  const isVIP = ATX.currentUser?.isPremium || ATX.currentUser?.isForever;
  ['ad-top', 'ad-mid', 'ad-bottom'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.parentElement.style.display = isVIP ? 'none' : 'block';
    if (!isVIP && !el.dataset.loaded) {
      // ← Paste Adsterra script here
      el.innerHTML = '<span style="color:#1e1e1e;font-size:10px;">[ Ad Zone — Replace with Adsterra script ]</span>';
      el.dataset.loaded = '1';
    }
  });
}

function getStatusBadge(status, planExpiry) {
  const labels = {
    lifetime: { cls: 'lifetime', txt: '♾ Lifetime VIP' },
    active:   { cls: 'active',   txt: '⭐ VIP Active' },
    trial:    { cls: 'trial',    txt: '🔵 Trial' },
    expired:  { cls: 'expired',  txt: '⚠ Expired' },
    blocked:  { cls: 'blocked',  txt: '🔴 Blocked' },
    free:     { cls: 'free',     txt: 'Free' },
  };
  const s = labels[status] || labels.free;
  let extra = '';
  if (status === 'active' && planExpiry) {
    const days = Math.ceil((new Date(planExpiry) - new Date()) / 86400000);
    extra = `<span class="expiry-info">(${days}d left)</span>`;
  }
  return `<span class="status-badge ${s.cls}">${s.txt}</span>${extra}`;
}
