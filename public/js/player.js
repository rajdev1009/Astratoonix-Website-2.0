// public/js/player.js — In-site video player

function openPlayer(id, type) {
  const item = type === 'movie'
    ? ATX.allContent.movies.find(m => m._id === id)
    : ATX.allContent.series.find(s => s._id === id);
  if (!item) return;

  const vip = isUserPremium();
  let html  = '';

  if (type === 'movie') {
    if (item.isPremium && !vip) {
      html = vipLockedHTML();
    } else {
      const link = item.links?.p480 || item.links?.p720 || item.links?.p1080 || item.links?.p4k || '';
      html = `<div class="video-wrap" id="video-wrap">${link ? buildPlayer(link) : backdropThumb(item.backdrop||item.poster,'🎬')}</div>
        <div class="player-info">
          <div class="player-title">${item.title}</div>
          <div class="player-sub">🎬 Movie &nbsp;·&nbsp; Choose Quality</div>
          <div class="quality-btns">${qualityBtnsHTML(item.links)}</div>
        </div>`;
    }
  } else {
    html = `<div class="video-wrap" id="video-wrap">${backdropThumb(item.poster,'📺')}</div>
      <div class="player-info">
        <div class="player-title">${item.title}</div>
        <div class="player-sub" id="ep-sub">📺 Series &nbsp;·&nbsp; Select Episode</div>
        <div class="quality-btns" id="ep-qbtns"></div>
      </div>
      <div class="episodes-list">
        <h4>Episodes</h4>
        ${(item.episodes||[]).map(ep => {
          const locked = ep.isPremium && !vip;
          const enc    = encodeURIComponent(JSON.stringify(ep));
          return `<div class="ep-item${locked?' locked':''}" id="ep-${ep.number}"
            onclick="${locked?'showVIPAlert()': `playEpisode(decodeURIComponent('${enc}'),'${encodeURIComponent(item.poster)}')`}">
            <span class="ep-label">Episode #${ep.number}</span>
            <span class="ep-status">${locked?'🔒 VIP Only':'▶ Play'}</span>
          </div>`;
        }).join('')}
      </div>`;
  }

  document.getElementById('player-inner').innerHTML = html;
  openModal('player-modal');
}

function playEpisode(dataStr, fallbackEnc) {
  let ep, fb;
  try { ep = JSON.parse(dataStr); fb = decodeURIComponent(fallbackEnc); } catch(e){ return; }

  document.querySelectorAll('.ep-item').forEach(el => {
    el.classList.remove('playing');
    const s = el.querySelector('.ep-status');
    if (s && !el.classList.contains('locked')) s.textContent = '▶ Play';
  });
  const el = document.getElementById('ep-' + ep.number);
  if (el) { el.classList.add('playing'); el.querySelector('.ep-status').textContent = '▶ Playing'; }

  const link = ep.links?.p480 || ep.links?.p720 || ep.links?.p1080 || ep.links?.p4k || '';
  const wrap = document.getElementById('video-wrap');
  if (wrap && link) wrap.innerHTML = buildPlayer(link);

  const qDiv = document.getElementById('ep-qbtns');
  if (qDiv) qDiv.innerHTML = qualityBtnsHTML(ep.links);
  const sub = document.getElementById('ep-sub');
  if (sub) sub.textContent = '▶ Now Playing: Episode #' + ep.number;
}

function buildPlayer(url) {
  if (!url) return '';
  url = url.trim();
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const m   = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const src = m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0` : url;
    return `<iframe src="${src}" allowfullscreen allow="autoplay;fullscreen;encrypted-media"></iframe>`;
  }
  if (url.includes('drive.google.com')) {
    const fid = (url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/))?.[1];
    const src = fid ? `https://drive.google.com/file/d/${fid}/preview` : url;
    return `<iframe src="${src}" allowfullscreen allow="autoplay;fullscreen"></iframe>`;
  }
  if (url.includes('.m3u8')) {
    const vid = 'hls-' + Date.now();
    setTimeout(() => {
      const v = document.getElementById(vid);
      if (!v) return;
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        hls.loadSource(url); hls.attachMedia(v);
        hls.on(Hls.Events.MANIFEST_PARSED, () => v.play().catch(()=>{}));
      } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
        v.src = url; v.play().catch(()=>{});
      }
    }, 100);
    return `<video id="${vid}" controls playsinline preload="metadata" style="width:100%;display:block;max-height:68vh;background:#000;"></video>`;
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return `<video controls autoplay playsinline preload="metadata" style="width:100%;display:block;max-height:68vh;background:#000;"><source src="${url}"/></video>`;
  }
  return `<iframe src="${url}" allowfullscreen allow="autoplay;fullscreen;encrypted-media" referrerpolicy="no-referrer" scrolling="no"></iframe>`;
}

function backdropThumb(img, icon) {
  return `<div class="player-backdrop-thumb"><img src="${img}" onerror="this.style.display='none'" alt=""/><div class="play-icon-center">${icon}</div></div>`;
}
function qualityBtnsHTML(links) {
  const avail = [['480p','p480'],['720p','p720'],['1080p','p1080'],['4K','p4k']].filter(([,k]) => links?.[k]);
  if (!avail.length) return '<span style="color:var(--muted);font-size:11px;">No links</span>';
  return avail.map(([l,k]) => `<button class="q-btn" onclick="switchQuality('${links[k]}')">${l}</button>`).join('');
}
function switchQuality(url) {
  const w = document.getElementById('video-wrap');
  if (w) w.innerHTML = buildPlayer(url);
}
function vipLockedHTML() {
  return `<div class="vip-locked-msg"><h3>🔒 VIP Content</h3><p>This content is for VIP members only.<br/>Contact admin to upgrade your account.</p><button class="btn-red" style="width:auto;padding:10px 22px;margin-top:14px;" onclick="closeModal('player-modal')">Close</button></div>`;
}
function showVIPAlert() { notify('🔒 VIP Content — Contact admin to upgrade', 'error'); }
