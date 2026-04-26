const qs = s => document.querySelector(s)

const SUPPLIER_KEY = 'fournisseurs_v1'
const PRODUCT_KEY = 'produits_v1'
const BLOCKCHAIN_KEY = 'blockchain_events_v1'

let suppliers = []
let products = []
let blockchain = []

/* ---------- Suppliers (existing, small refactor) ---------- */
function loadSuppliers(){
  const raw = localStorage.getItem(SUPPLIER_KEY)
  if(raw){
    try{ suppliers = JSON.parse(raw) }catch(e){ suppliers = [] }
  } else {
    suppliers = [
      {id:1,name:'Société Alpha',email:'contact@alpha.com',phone:'+212600000001',country:'Maroc'},
      {id:2,name:'Beta Fournitures',email:'info@beta.com',phone:'+212600000002',country:'France'}
    ]
    saveSuppliers()
  }
}

function saveSuppliers(){ localStorage.setItem(SUPPLIER_KEY, JSON.stringify(suppliers)) }

function renderSuppliers(filter=''){
  const list = qs('#list')
  list.innerHTML = ''
  const flt = filter.trim().toLowerCase()
  const visible = suppliers.filter(s => !flt || s.name.toLowerCase().includes(flt) || (s.email||'').toLowerCase().includes(flt) )
  if(visible.length===0){ list.innerHTML = '<div class="card">Aucun fournisseur trouvé.</div>'; return }
  visible.forEach(s => {
    const el = document.createElement('div')
    el.className = 'supplier'
    el.innerHTML = `<h3>${escapeHtml(s.name)}</h3>
      <div class="muted">${escapeHtml(s.email || '')}</div>
      <div class="meta"><div class="small">${escapeHtml(s.phone||'')}</div><div class="small">${escapeHtml(s.country||'')}</div></div>
      <div style="display:flex;gap:8px;margin-top:8px"><button class="btn-ghost" data-id="${s.id}" data-action="delete">Supprimer</button></div>`
    list.appendChild(el)
  })

  // handle clicks on certificate items (validate / view)
  qs('#cert-list').addEventListener('click', e=>{
    const el = e.target.closest('.cert-item')
    if(!el) return
    const name = el.textContent
    if(confirm(`Valider le certificat "${name}" ? (simulation)`)){
      const pid = Number(qs('#product-form').id.value)
      if(pid){ const p = products.find(x=>x.id===pid); if(p){ const c = p.certificates.find(x=>x.name===name); if(c){ simulateValidateCert(p.id,c.name) } }} else alert('Ouvrez le produit en modification pour valider un certificat.')
    }
  })

  // periodic checks for certificate expirations
  setInterval(checkCertExpirations, 1000 * 60 * 60) // hourly
  checkCertExpirations()
}

/* ---------- Products (new features) ---------- */
function loadProducts(){
  try{ products = JSON.parse(localStorage.getItem(PRODUCT_KEY) || '[]') }catch(e){ products = [] }
}
function saveProducts(){ localStorage.setItem(PRODUCT_KEY, JSON.stringify(products)) }

function loadBlockchain(){
  try{ blockchain = JSON.parse(localStorage.getItem(BLOCKCHAIN_KEY) || '[]') }catch(e){ blockchain = [] }
}
function saveBlockchain(){ localStorage.setItem(BLOCKCHAIN_KEY, JSON.stringify(blockchain)) }

function renderProducts(filter=''){
  const list = qs('#product-list')
  list.innerHTML = ''
  const flt = filter.trim().toLowerCase()
  const visible = products.filter(p => !flt || (p.name||'').toLowerCase().includes(flt) || (p.sku||'').toLowerCase().includes(flt) )
  if(visible.length===0){ list.innerHTML = '<div class="card">Aucun produit.</div>'; return }
  visible.forEach(p => {
    const el = document.createElement('div')
    el.className = 'product'
    // badges for certificates (status: pending|validated|expired)
    const certHtml = (p.certificates||[]).map(c=>`<span class="cert-badge cert-${(c.status||'pending')}">${escapeHtml(c.name)}${c.expiry? ' ('+escapeHtml(c.expiry)+')':''}</span>`).join(' ')
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
      </div>`
    list.appendChild(el)
  })
}

function addProduct(payload){
  const id = Date.now()
  products.unshift(Object.assign({id,certificates:[]}, payload))
  saveProducts(); recordBlockchainEvent(id,'created',{name:payload.name})
  renderProducts(qs('#search-products').value || '')
  updateDashboardAndAlerts()
}

function updateProduct(id, payload){
  const idx = products.findIndex(p=>p.id===id)
  if(idx===-1) return
  products[idx] = Object.assign(products[idx], payload)
  saveProducts(); recordBlockchainEvent(id,'updated',payload)
  renderProducts(qs('#search-products').value || '')
  updateDashboardAndAlerts()
}

function deleteProduct(id){
  products = products.filter(p=>p.id!==id)
  saveProducts(); recordBlockchainEvent(id,'deleted',{})
  renderProducts(qs('#search-products').value || '')
  updateDashboardAndAlerts()
}

function recordBlockchainEvent(productId, action, meta){
  const event = {ts:Date.now(),productId,action,meta}
  blockchain.unshift(event)
  saveBlockchain()
  renderHistory()
}

function renderHistory(){
  const el = qs('#history-list')
  if(!el) return
  if(blockchain.length===0){ el.innerHTML = '<div class="small muted">Aucun événement enregistré.</div>'; return }
  el.innerHTML = blockchain.slice(0,50).map(e => {
    const d = new Date(e.ts).toLocaleString()
    return `<div>${d} — produit ${e.productId} — ${escapeHtml(e.action)} ${e.meta && e.meta.name ? '• '+escapeHtml(e.meta.name) : ''}</div>`
  }).join('')
}

/* ---------- CSV import/export (simple) ---------- */
function exportProductsCSV(){
  if(products.length===0) return alert('Aucun produit à exporter')
  const cols = ['id','name','sku','price','stock','producer','country']
  const rows = [cols.join(',')].concat(products.map(p=>cols.map(c=>`"${String(p[c]||'').replace(/"/g,'""')}"`).join(',')))
  const blob = new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8;'}), url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'produits.csv'; a.click(); URL.revokeObjectURL(url)
}

function importProductsFile(file){
  const reader = new FileReader()
  reader.onload = () => {
    const text = reader.result
    try{
      if(file.type==='application/json' || file.name.endsWith('.json')){
        const data = JSON.parse(text)
        if(Array.isArray(data)){ data.forEach(d=>{ d.id= d.id||Date.now()+Math.random(); products.unshift(d) }); saveProducts(); renderProducts() }
        return
      }
      // CSV simple
      const lines = text.split(/\r?\n/).filter(Boolean)
      const headers = lines.shift().split(',').map(h=>h.replace(/(^\"|\"$)/g,''))
      lines.forEach(l=>{
        const parts = l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        const obj = {}
        headers.forEach((h,i)=> obj[h.trim()] = (parts[i]||'').replace(/(^\"|\"$)/g,'').trim())
        obj.id = Number(obj.id) || Date.now()+Math.random()
        products.unshift(obj)
      })
      saveProducts(); renderProducts()
    }catch(e){ alert('Erreur import: '+e.message) }
  }
  reader.readAsText(file)
}

/* ---------- Utilities & validation (AI placeholder) ---------- */
function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function validateProduct(p){
  const issues = []
  if(!p.name || !p.name.trim()) issues.push('Le nom est requis')
  if(p.price!=null && (isNaN(Number(p.price)) || Number(p.price)<0)) issues.push('Prix invalide')
  if(p.stock!=null && (!Number.isInteger(Number(p.stock)) || Number(p.stock)<0)) issues.push('Stock invalide')
  return issues
}

/* ---------- Dashboard & alerts ---------- */
function updateDashboardAndAlerts(){
  const low = products.filter(p => Number(p.stock||0) < (Number(p.alertThreshold||5))).length
  qs('#stock-alerts').textContent = low>0 ? `⚠️ ${low} produits en stock faible` : ''
  // dashboard stats
  const stats = qs('#dashboard-stats')
  if(stats){
    stats.innerHTML = `<div class="card"><strong>${products.length}</strong><div class="small">Produits</div></div>
      <div class="card"><strong>${suppliers.length}</strong><div class="small">Fournisseurs</div></div>
      <div class="card"><strong>${blockchain.length}</strong><div class="small">Événements blockchain</div></div>`
  }
}

/* ---------- UI wiring ---------- */
function init(){
  loadSuppliers(); loadProducts(); loadBlockchain(); renderSuppliers(); renderProducts(); renderHistory(); updateDashboardAndAlerts()

  // Tab switching
  document.querySelectorAll('.sidebar nav li').forEach(li=> li.addEventListener('click', ()=>{
    document.querySelectorAll('.sidebar nav li').forEach(x=>x.classList.remove('active'))
    li.classList.add('active')
    const tab = li.dataset.tab
    document.querySelectorAll('.view').forEach(v=> v.classList.add('hidden'))
    qs('#view-'+tab).classList.remove('hidden')
  }))

  // Suppliers
  qs('#btn-add').addEventListener('click', ()=> qs('#form-area').classList.toggle('hidden'))
  qs('#btn-cancel').addEventListener('click', ()=>{ qs('#supplier-form').reset(); qs('#form-area').classList.add('hidden') })
  qs('#supplier-form').addEventListener('submit', e=>{
    e.preventDefault(); const form=e.target; const data={name:form.name.value.trim(),email:form.email.value.trim(),phone:form.phone.value.trim(),country:form.country.value.trim()}
    if(!data.name) return alert('Le nom est requis')
    suppliers.unshift(Object.assign({id:Date.now()},data)); saveSuppliers(); renderSuppliers(); form.reset(); qs('#form-area').classList.add('hidden')
  })
  qs('#search').addEventListener('input', e=> renderSuppliers(e.target.value))
  qs('#list').addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return; const id=Number(btn.dataset.id); const action=btn.dataset.action
    if(action==='delete' && confirm('Supprimer ce fournisseur ?')){ suppliers = suppliers.filter(s=>s.id!==id); saveSuppliers(); renderSuppliers() }
  })

  // Products UI
  qs('#btn-add-product').addEventListener('click', ()=>{
    qs('#product-form').reset(); qs('#product-form-title').textContent='Ajouter un produit'; qs('#cert-list').innerHTML=''; qs('#product-form-area').classList.toggle('hidden')
  })
  qs('#btn-cancel-product').addEventListener('click', ()=>{ qs('#product-form').reset(); qs('#product-form-area').classList.add('hidden') })

  qs('#product-form').addEventListener('submit', e=>{
    e.preventDefault(); const f=e.target
    const payload = { name:f.name.value.trim(), sku:f.sku.value.trim(), price: Number(f.price.value)||0, stock: Number(f.stock.value)||0, producer:f.producer.value.trim(), country:f.country.value.trim() }
    const id = f.id.value ? Number(f.id.value) : null
    const issues = validateProduct(payload)
    if(issues.length){ if(!confirm('Problèmes détectés:\n- '+issues.join('\n- ')+'\nSouhaitez-vous continuer ?')) return }
    if(id){ updateProduct(id,payload) } else { addProduct(payload) }
    // attach any temporary uploaded certs saved on cert-list
    const tmp = qs('#cert-list')
    if(tmp && tmp.dataset._tmp){
      try{
        const arr = tmp.dataset._tmp.split(/(?<=\}),/).map(s=>JSON.parse(s))
        const lastId = id || products[0].id
        const prod = products.find(p=>p.id===lastId)
        if(prod){ prod.certificates = prod.certificates || []; arr.forEach(c=>{ c.status='pending'; c.expiry = qs('#cert-expiry')?.value || null; prod.certificates.push(c); recordBlockchainEvent(prod.id,'certificate_uploaded',{name:c.name,expiry:c.expiry}) })
          saveProducts();
        }
      }catch(err){ console.warn('tmp cert parse',err) }
      tmp.dataset._tmp = ''
      tmp.innerHTML = ''
    }
    f.reset(); qs('#product-form-area').classList.add('hidden')
  })

  qs('#search-products').addEventListener('input', e=> renderProducts(e.target.value))

  // product list actions: edit/delete/history
  qs('#product-list').addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return; const id = Number(btn.dataset.id); const act=btn.dataset.action
    if(act==='delete' && confirm('Supprimer ce produit ?')) deleteProduct(id)
    if(act==='edit'){
      const p = products.find(x=>x.id===id); if(!p) return; const f = qs('#product-form')
      f.id.value = p.id; f.name.value = p.name; f.sku.value = p.sku; f.price.value = p.price; f.stock.value = p.stock; f.producer.value = p.producer; f.country.value = p.country
      qs('#product-form-title').textContent='Modifier le produit'; qs('#product-form-area').classList.remove('hidden')
      qs('#cert-list').innerHTML = (p.certificates||[]).map(c=>`<div class="cert-item">${escapeHtml(c.name)}</div>`).join('')
    }
    if(act==='history'){
      // show blockchain events for product in history panel
      const hist = blockchain.filter(ev => ev.productId===id)
      qs('#history-list').innerHTML = hist.length? hist.map(h=>`${new Date(h.ts).toLocaleString()} — ${escapeHtml(h.action)}`).join('<br>') : '<div class="small muted">Aucun historique pour ce produit.</div>'
      // switch to dashboard view
      document.querySelectorAll('.sidebar nav li').forEach(x=>x.classList.remove('active'))
      document.querySelector('[data-tab="dashboard"]').classList.add('active')
      document.querySelectorAll('.view').forEach(v=> v.classList.add('hidden'))
      qs('#view-dashboard').classList.remove('hidden')
    }
    if(act==='add-step'){
      const desc = prompt('Description de l\'étape de production :')
      if(desc){ recordBlockchainEvent(id,'production_step',{desc}); alert('Étape enregistrée sur la chaine (simulé).') }
    }
    if(act==='export-history'){
      const hist = blockchain.filter(ev=>ev.productId===id)
      if(hist.length===0) return alert('Aucun historique à exporter')
      const blob = new Blob([JSON.stringify(hist,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`history_product_${id}.json`; a.click(); URL.revokeObjectURL(url)
    }
  })

  // cert upload
  qs('#cert-upload').addEventListener('change', e=>{
    const files = Array.from(e.target.files)
    const fform = qs('#product-form')
    const id = fform.id.value ? Number(fform.id.value) : null
    files.forEach(file=>{
      const reader = new FileReader(); reader.onload = ()=>{
          const obj = {name:file.name,type:file.type,data:reader.result, expiry: qs('#cert-expiry')?.value || null, status:'pending'}
        if(id){ const p = products.find(x=>x.id===id); if(p){ p.certificates = p.certificates || []; p.certificates.push(obj); saveProducts(); qs('#cert-list').innerHTML = p.certificates.map(c=>`<div class="cert-item">${escapeHtml(c.name)}</div>`).join('') } }
        else{ // attach temporarily to form element
          const tmp = qs('#cert-list'); tmp.innerHTML += `<div class="cert-item">${escapeHtml(file.name)}</div>`; tmp.dataset._tmp = tmp.dataset._tmp? tmp.dataset._tmp+','+JSON.stringify(obj): JSON.stringify(obj)
        }
      }; reader.readAsDataURL(file)
    })
  })

  // prefill via JSON
  qs('#prefill-json').addEventListener('change', e=>{
    const f = e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const data=JSON.parse(r.result); const form=qs('#product-form'); form.name.value=data.name||''; form.sku.value=data.sku||''; form.price.value=data.price||''; form.stock.value=data.stock||''; form.producer.value=data.producer||''; form.country.value=data.country||'' }catch(err){ alert('JSON invalide') } }; r.readAsText(f)
  })

  // CSV import/export
  qs('#csv-export').addEventListener('click', exportProductsCSV)
  qs('#csv-import').addEventListener('change', e=>{ const f=e.target.files[0]; if(f) importProductsFile(f); e.target.value='' })

  // initial dashboard
  renderHistory(); updateDashboardAndAlerts()
}

function simulateValidateCert(productId, certName){
  const p = products.find(x=>x.id===productId); if(!p) return
  const c = p.certificates.find(x=>x.name===certName); if(!c) return
  c.status = 'validated'
  saveProducts()
  recordBlockchainEvent(productId,'certificate_validated',{name:certName})
  alert('Certificat marqué comme validé (simulation).')
}

function checkCertExpirations(){
  const now = Date.now()
  const soon = 1000 * 60 * 60 * 24 * 30 // 30 days
  let reminders = []
  products.forEach(p=>{
    (p.certificates||[]).forEach(c=>{
      if(c.expiry){
        const ts = new Date(c.expiry).getTime()
        if(ts && ts < now){ reminders.push(`Certificat ${c.name} du produit ${p.name} est expiré.`) }
        else if(ts && ts - now <= soon){ reminders.push(`Certificat ${c.name} du produit ${p.name} expirera bientôt (${c.expiry}).`) }
      }
    })
  })
  const historyEl = qs('#history-list')
  if(historyEl){
    const lines = reminders.length? reminders.map(r=>`<div class="alert">${escapeHtml(r)}</div>`).join('') : ''
    const bc = blockchain.slice(0,20).map(e=>`${new Date(e.ts).toLocaleString()} — ${escapeHtml(e.action)}${e.meta && e.meta.name? ' • '+escapeHtml(e.meta.name):''}`).join('<br>')
    historyEl.innerHTML = (lines? lines + '<hr/>' : '') + (bc || '<div class="small muted">Aucun événement enregistré.</div>')
  }
}

document.addEventListener('DOMContentLoaded', init)
