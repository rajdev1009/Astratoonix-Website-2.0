// public/js/api.js — All HTTP calls

const API = {
  _adminHeaders() {
    return { 'Content-Type': 'application/json', 'x-admin-token': ATX.ADMIN_PASSWORD };
  },
  async get(url) {
    const r = await fetch(url);
    return r.json();
  },
  async adminGet(url) {
    const r = await fetch(url, { headers: this._adminHeaders() });
    return r.json();
  },
  async post(url, body) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  },
  async adminPost(url, body) {
    const r = await fetch(url, { method: 'POST', headers: this._adminHeaders(), body: JSON.stringify(body) });
    return r.json();
  },
  async adminPatch(url, body = {}) {
    const r = await fetch(url, { method: 'PATCH', headers: this._adminHeaders(), body: JSON.stringify(body) });
    return r.json();
  },
  async adminDelete(url, body = {}) {
    const r = await fetch(url, { method: 'DELETE', headers: this._adminHeaders(), body: JSON.stringify(body) });
    return r.json();
  }
};
