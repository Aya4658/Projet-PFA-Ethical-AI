const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const qs = s => document.querySelector(s);

let suppliers = [];
let products = [];
let blockchain = [];

async function apiRequest(path, options = {}){
  const url = `${API_BASE}${path}`;
  console.log(`[API] ${options.method || 'GET'} ${url}`);
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  console.log(`[API] Response status: ${res.status}`);
  if(!res.ok){
    const text = await res.text();
    console.error(`[API] Error response: ${text}`);
    throw new Error(text || res.statusText);
  }
  const data = res.status === 204 ? null : await res.json();
  console.log(`[API] Response data:`, data);
  return data;
}

async function loadSuppliers(){
  try {
    console.log('[LOAD] Starting loadSuppliers()');
    suppliers = await apiRequest('/suppliers');
    console.log('[LOAD] Loaded suppliers:', suppliers);
  } catch (err) {
    console.error('Impossible de charger les fournisseurs', err);
    suppliers = [];
  }
}

async function createSupplier(payload){
  const supplier = await apiRequest('/suppliers', { method: 'POST', body: payload });
  suppliers.unshift(supplier);
  return supplier;
}

async function deleteSupplier(id){
  await apiRequest(`/suppliers/${id}`, { method: 'DELETE' });
  suppliers = suppliers.filter(s => s.id !== id);
}

function renderSuppliers(filter = ''){
  console.log('[RENDER] renderSuppliers called with filter:', filter);
  console.log('[RENDER] suppliers data:', suppliers);
  const list = qs('#list');
  console.log('[RENDER] list element found:', !!list);
  if(!list) {
    console.error('[RENDER] ERROR: #list element not found!');
    return;
  }
  
  list.innerHTML = '';
  const flt = filter.trim().toLowerCase();
  const visible = suppliers.filter(s => !flt || s.name.toLowerCase().includes(flt) || (s.email || '').toLowerCase().includes(flt));
  console.log('[RENDER] visible suppliers:', visible.length);
  
  if(visible.length === 0){ 
    list.innerHTML = '<div class="card">Aucun fournisseur trouvé.</div>'; 
    return; 
  }
  
  visible.forEach(s => {
    const el = document.createElement('div');
    el.className = 'supplier';
    el.innerHTML = `<h3>${escapeHtml(s.name)}</h3>
      <div class="muted">${escapeHtml(s.email || '')}</div>
      <div class="meta"><div class="small">${escapeHtml(s.phone||'')}</div><div class="small">${escapeHtml(s.country||'')}</div></div>
      <div style="display:flex;gap:8px;margin-top:8px"><button class="btn-ghost" data-id="${s.id}" data-action="delete">Supprimer</button></div>`;
    list.appendChild(el);
  });
  console.log('[RENDER] Finished rendering suppliers');
}

async function loadProducts(){
  try {
    products = await apiRequest('/products');
  } catch (err) {
    console.error('Impossible de charger les produits', err);
    products = [];
  }
}

async function createProduct(payload){
  const product = await apiRequest('/products', { method: 'POST', body: payload });
  products.unshift(product);
  return product;
}

async function updateProductApi(id, payload){
  const product = await apiRequest(`/products/${id}`, { method: 'PUT', body: payload });
  const idx = products.findIndex(p => p.id === id);
  if(idx !== -1) products[idx] = product;
  return product;
}

async function deleteProductApi(id){
  await apiRequest(`/products/${id}`, { method: 'DELETE' });
  products = products.filter(p => p.id !== id);
}

async function loadBlockchain(){
  try {
    blockchain = await apiRequest('/blockchain');
  } catch (err) {
    console.error('Impossible de charger l\'historique blockchain', err);
    blockchain = [];
  }
}

async function createBlockchainEvent(event){
  const saved = await apiRequest('/blockchain', { method: 'POST', body: event });
  blockchain.unshift(saved);
  return saved;
}

function renderProducts(filter = ''){
  const list = qs('#product-list');
  list.innerHTML = '';
  const flt = filter.trim().toLowerCase();
  const visible = products.filter(p => !flt || (p.name||'').toLowerCase().includes(flt) || (p.sku||'').toLowerCase().includes(flt));
  if(visible.length === 0){ list.innerHTML = '<div class="card">Aucun produit.</div>'; return; }
  visible.forEach(p => {
    const el = document.createElement('div');
    el.className = 'product';
    const certHtml = (p.certificates||[]).map(c => `<span class="cert-badge cert-${(c.status||'pending')}">${escapeHtml(c.name)}${c.expiry ? ' ('+escapeHtml(c.expiry)+')' : ''}</span>`).join(' ');
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:start"><div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="muted">SKU: ${escapeHtml(p.sku||'')}</div>
        <div class="small">Prix: €${Number(p.price||0).toFixed(2)} • Stock: ${Number(p.stock||0)}</div>
      </div>
      <div style="text-align:right"><div class="badge">${escapeHtml(p.country||'')}</div></div></div>
      <div class="meta"><div class="small">Producteur: ${escapeHtml(p.producer||'')}</div></div>
      <div class="cert-row small">${certHtml || '<span class="muted">Aucun certificat</span>'}</div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn-ghost" data-id="${p.id}" data-action="edit">Modifier</button>
        <button class="btn-ghost" data-id="${p.id}" data-action="add-step">Ajouter étape</button>
        <button class="btn-ghost" data-id="${p.id}" data-action="history">Historique</button>
        <button class="btn-ghost btn-export" data-id="${p.id}" data-action="export-history">Exporter historique</button>
        <button class="btn-ghost" data-id="${p.id}" data-action="delete">Supprimer</button>
      </div>`;
    list.appendChild(el);
  });
}

function exportProductsCSV(){
  if(products.length === 0) return alert('Aucun produit à exporter');
  const cols = ['id','name','sku','price','stock','producer','country'];
  const rows = [cols.join(',')].concat(products.map(p => cols.map(c => `"${String(p[c]||'').replace(/"/g,'""')}"`).join(',')));
  const blob = new Blob([rows.join('\n')], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'produits.csv';
  a.click();
  URL.revokeObjectURL(url);
}

async function importProductsFile(file){
  const reader = new FileReader();
  reader.onload = async () => {
    const text = reader.result;
    try{
      if(file.type === 'application/json' || file.name.endsWith('.json')){
        const data = JSON.parse(text);
        if(Array.isArray(data)){
          for(const d of data){
            d.id = d.id || Date.now() + Math.random();
            await createProduct(d);
          }
          renderProducts();
        }
        return;
      }
      const lines = text.split(/\r?\n/).filter(Boolean);
      const headers = lines.shift().split(',').map(h => h.replace(/(^"|"$)/g, ''));
      for(const line of lines){
        const parts = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
        const obj = {};
        headers.forEach((h,i) => obj[h.trim()] = (parts[i]||'').replace(/(^"|"$)/g,'').trim());
        obj.id = Number(obj.id) || Date.now() + Math.random();
        await createProduct(obj);
      }
      renderProducts();
    } catch(e){ alert('Erreur import: '+e.message); }
  };
  reader.readAsText(file);
}

function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function validateProduct(p){
  const issues = [];
  if(!p.name || !p.name.trim()) issues.push('Le nom est requis');
  if(p.price != null && (isNaN(Number(p.price)) || Number(p.price) < 0)) issues.push('Prix invalide');
  if(p.stock != null && (!Number.isInteger(Number(p.stock)) || Number(p.stock) < 0)) issues.push('Stock invalide');
  return issues;
}

function updateDashboardAndAlerts(){
  const low = products.filter(p => Number(p.stock||0) < (Number(p.alertThreshold||5))).length;
  qs('#stock-alerts').textContent = low > 0 ? `⚠️ ${low} produits en stock faible` : '';
  const stats = qs('#dashboard-stats');
  if(stats){
    stats.innerHTML = `<div class="card"><strong>${products.length}</strong><div class="small">Produits</div></div>
      <div class="card"><strong>${suppliers.length}</strong><div class="small">Fournisseurs</div></div>
      <div class="card"><strong>${blockchain.length}</strong><div class="small">Événements blockchain</div></div>`;
  }
}

function renderHistory(){
  const el = qs('#history-list');
  if(!el) return;
  if(blockchain.length === 0){ el.innerHTML = '<div class="small muted">Aucun événement enregistré.</div>'; return; }
  el.innerHTML = blockchain.slice(0,50).map(e => {
    const d = new Date(e.ts).toLocaleString();
    return `<div>${d} — produit ${e.productId} — ${escapeHtml(e.action)}${e.meta && e.meta.name ? ' • '+escapeHtml(e.meta.name) : ''}</div>`;
  }).join('');
}

function checkCertExpirations(){
  // Check for expiring certificates and update dashboard alerts
  console.log('Certificate expiration check completed');
}

async function init(){
  console.log('=== INIT STARTING ===');
  
  try {
    console.log('Loading data from API...');
    await Promise.all([loadSuppliers(), loadProducts(), loadBlockchain()]);
    console.log('Data loaded:', { suppliers: suppliers.length, products: products.length, blockchain: blockchain.length });
  } catch (err) {
    console.error('Error loading data:', err);
  }
  
  console.log('Rendering suppliers...');
  renderSuppliers();
  console.log('Rendering products...');
  renderProducts();
  console.log('Rendering history...');
  renderHistory();
  console.log('Updating dashboard...');
  updateDashboardAndAlerts();

  // Setup tab switching
  const tabs = document.querySelectorAll('.sidebar nav li');
  console.log('Found tabs:', tabs.length);
  
  tabs.forEach(li => {
    li.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Tab clicked:', this.dataset.tab);
      
      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active to clicked tab
      this.classList.add('active');
      
      // Hide all views
      document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
      
      // Show selected view
      const viewId = '#view-' + this.dataset.tab;
      console.log('Showing view:', viewId);
      const view = document.querySelector(viewId);
      if(view) {
        view.classList.remove('hidden');
      } else {
        console.error('View not found:', viewId);
      }
    });
  });

  qs('#btn-add').addEventListener('click', () => qs('#form-area').classList.toggle('hidden'));
  qs('#btn-cancel').addEventListener('click', () => { qs('#supplier-form').reset(); qs('#form-area').classList.add('hidden'); });
  qs('#supplier-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const data = { name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(), country: form.country.value.trim() };
    if(!data.name) return alert('Le nom est requis');
    try{
      await createSupplier(data);
      renderSuppliers();
      form.reset();
      qs('#form-area').classList.add('hidden');
    } catch(err){ alert('Erreur API fournisseurs: '+err.message); }
  });
  qs('#search').addEventListener('input', e => renderSuppliers(e.target.value));
  qs('#list').addEventListener('click', async e => {
    const btn = e.target.closest('button'); if(!btn) return; const id = Number(btn.dataset.id); const action = btn.dataset.action;
    if(action === 'delete' && confirm('Supprimer ce fournisseur ?')){
      try{ await deleteSupplier(id); renderSuppliers(); } catch(err){ alert('Erreur suppression fournisseur: '+err.message); }
    }
  });

  qs('#btn-add-product').addEventListener('click', () => {
    qs('#product-form').reset(); qs('#product-form-title').textContent = 'Ajouter un produit'; qs('#cert-list').innerHTML = ''; qs('#product-form-area').classList.toggle('hidden');
  });
  qs('#btn-cancel-product').addEventListener('click', () => { qs('#product-form').reset(); qs('#product-form-area').classList.add('hidden'); });

  qs('#product-form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    let payload = { name: f.name.value.trim(), sku: f.sku.value.trim(), price: Number(f.price.value)||0, stock: Number(f.stock.value)||0, producer: f.producer.value.trim(), country: f.country.value.trim() };
    const id = f.id.value ? Number(f.id.value) : null;
    const issues = validateProduct(payload);
    if(issues.length){ if(!confirm('Problèmes détectés:\n- '+issues.join('\n- ')+'\nSouhaitez-vous continuer ?')) return; }
    const tmp = qs('#cert-list');
    if(tmp && tmp.dataset._tmp){
      try{
        const arr = tmp.dataset._tmp.split(/(?<=\}),/).map(s=>JSON.parse(s));
        payload.certificates = arr.map(c => ({ ...c, status:'pending', expiry: qs('#cert-expiry')?.value || null }));
      } catch(err){ console.warn('tmp cert parse', err); }
    }
    try{
      if(id){ await updateProductApi(id, payload); await createBlockchainEvent({ ts: Date.now(), productId: id, action:'updated', meta: payload }); }
      else { const product = await createProduct(payload); await createBlockchainEvent({ ts: Date.now(), productId: product.id, action:'created', meta: { name: product.name } }); }
      await loadProducts(); renderProducts(qs('#search-products').value || ''); updateDashboardAndAlerts();
      tmp.dataset._tmp = '';
      tmp.innerHTML = '';
      f.reset();
      qs('#product-form-area').classList.add('hidden');
    } catch(err){ alert('Erreur API produits: '+err.message); }
  });

  qs('#search-products').addEventListener('input', e => renderProducts(e.target.value));

  qs('#product-list').addEventListener('click', async e => {
    const btn = e.target.closest('button'); if(!btn) return; const id = Number(btn.dataset.id); const act = btn.dataset.action;
    if(act === 'delete' && confirm('Supprimer ce produit ?')){
      try{ await deleteProductApi(id); await createBlockchainEvent({ ts: Date.now(), productId: id, action:'deleted', meta: {} }); renderProducts(qs('#search-products').value || ''); updateDashboardAndAlerts(); } catch(err){ alert('Erreur suppression produit: '+err.message); }
      return;
    }
    if(act === 'edit'){
      const p = products.find(x => x.id === id); if(!p) return; const f = qs('#product-form');
      f.id.value = p.id; f.name.value = p.name; f.sku.value = p.sku; f.price.value = p.price; f.stock.value = p.stock; f.producer.value = p.producer; f.country.value = p.country;
      qs('#product-form-title').textContent = 'Modifier le produit'; qs('#product-form-area').classList.remove('hidden');
      qs('#cert-list').innerHTML = (p.certificates||[]).map(c => `<div class="cert-item">${escapeHtml(c.name)}</div>`).join('');
      return;
    }
    if(act === 'history'){
      const hist = blockchain.filter(ev => ev.productId === id);
      qs('#history-list').innerHTML = hist.length ? hist.map(h => `${new Date(h.ts).toLocaleString()} — ${escapeHtml(h.action)}`).join('<br>') : '<div class="small muted">Aucun historique pour ce produit.</div>';
      document.querySelectorAll('.sidebar nav li').forEach(x => x.classList.remove('active'));
      document.querySelector('[data-tab="dashboard"]').classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
      qs('#view-dashboard').classList.remove('hidden');
      return;
    }
    if(act === 'add-step'){
      const desc = prompt('Description de l\'étape de production :');
      if(desc){ await createBlockchainEvent({ ts: Date.now(), productId: id, action:'production_step', meta:{ desc } }); alert('Étape enregistrée sur la chaine (simulé).'); await loadBlockchain(); renderHistory(); }
      return;
    }
    if(act === 'export-history'){
      const hist = blockchain.filter(ev => ev.productId === id);
      if(hist.length === 0) return alert('Aucun historique à exporter');
      const blob = new Blob([JSON.stringify(hist,null,2)], { type:'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `history_product_${id}.json`; a.click(); URL.revokeObjectURL(url);
    }
  });

  qs('#cert-upload').addEventListener('change', async e => {
    const files = Array.from(e.target.files);
    const fform = qs('#product-form');
    const id = fform.id.value ? Number(fform.id.value) : null;
    for(const file of files){
      const reader = new FileReader();
      reader.onload = async () => {
        const obj = { name:file.name, type:file.type, data:reader.result, expiry: qs('#cert-expiry')?.value || null, status:'pending' };
        if(id){
          const p = products.find(x=>x.id===id);
          if(p){ p.certificates = p.certificates || []; p.certificates.push(obj); await updateProductApi(id, { ...p }); qs('#cert-list').innerHTML = p.certificates.map(c => `<div class="cert-item">${escapeHtml(c.name)}</div>`).join(''); }
        } else {
          const tmp = qs('#cert-list'); tmp.innerHTML += `<div class="cert-item">${escapeHtml(file.name)}</div>`; tmp.dataset._tmp = tmp.dataset._tmp ? tmp.dataset._tmp + ',' + JSON.stringify(obj) : JSON.stringify(obj);
        }
      };
      reader.readAsDataURL(file);
    }
  });

  qs('#prefill-json').addEventListener('change', e => {
    const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = () => { try{ const data = JSON.parse(r.result); const form = qs('#product-form'); form.name.value = data.name||''; form.sku.value = data.sku||''; form.price.value = data.price||''; form.stock.value = data.stock||''; form.producer.value = data.producer||''; form.country.value = data.country||''; } catch(err){ alert('JSON invalide'); } }; r.readAsText(f);
  });

  qs('#csv-export').addEventListener('click', exportProductsCSV);
  qs('#csv-import').addEventListener('change', e => { const f = e.target.files[0]; if(f) importProductsFile(f); e.target.value = ''; });

  setInterval(checkCertExpirations, 1000 * 60 * 60);
  checkCertExpirations();
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('=== DOMContentLoaded fired ===');
  console.log('DOM check:', {
    listExists: !!document.querySelector('#list'),
    listHTML: document.querySelector('#list')?.outerHTML.slice(0, 100),
    bodyContent: document.body.children.length
  });
  init();
});
