import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { ShoppingCart, MapPin, Plus, Minus, X, Trash2, ArrowLeft, Navigation, FileText, Printer, Settings, PlusCircle, Save, ImagePlus, Pencil, Users, BarChart3, Clock, DollarSign } from 'lucide-react';
import Map, { Marker, GeolocateControl, Source, Layer } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { fetchCatalogFromCloud, saveCatalogToCloud, fetchCustomersFromCloud, saveCustomersToCloud, saveInvoice, fetchInvoices } from './db';
import { DEFAULT_CATALOG, DEFAULT_CUSTOMERS } from './constants';

// Configure MapLibre RTL Plugin for Arabic text rendering
maplibregl.setRTLTextPlugin(
  'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
  null,
  true // Lazy load the plugin
);

const MAPTILER_KEY = 'XJjj2pOhjNSZrecDvLx8';

/* ─── SPLASH SCREEN ─── */
function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2200);
    const t2 = setTimeout(onFinish, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFinish]);

  return (
    <div className={`splash ${fadeOut ? 'splash--out' : ''}`}>
      <div className="splash__inner">
        <div className="splash__circle"><MapPin size={36} color="#fff" /></div>
        <h1 className="splash__title">Ouni</h1>
        <p className="splash__verse">إن الرزق من عند الله</p>
        <div className="splash__bar"><div className="splash__bar-fill" /></div>
      </div>
    </div>
  );
}

/* ─── ADD PRODUCT MODAL ─── */
function AddProductModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [pricePiece, setPricePiece] = useState('');
  const [priceBox, setPriceBox] = useState('');
  const [piecesPerBox, setPiecesPerBox] = useState('12');
  const [imgPreview, setImgPreview] = useState(null);
  const [imgData, setImgData] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImgData(ev.target.result);
      setImgPreview(ev.target.result);
      // Auto-fill name from filename if empty
      if (!name) {
        const fname = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setName(fname.charAt(0).toUpperCase() + fname.slice(1));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name || !pricePiece) return;
    onAdd({
      id: 'p_' + Date.now(),
      name,
      pricePiece: parseFloat(pricePiece) || 0,
      priceBox: parseFloat(priceBox) || 0,
      piecesPerBox: parseInt(piecesPerBox) || 12,
      img: imgData || '',
    });
    onClose();
  };

  return (
    <div className="overlay fade-in" onClick={onClose}>
      <div className="modal slide-up" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle" />
        <header className="modal__head">
          <h2>Ajouter Produit</h2>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </header>
        <div className="modal__body">
          <div className="form-group">
            {/* Image Upload */}
            <label className="img-upload" htmlFor="product-img">
              {imgPreview ? (
                <img src={imgPreview} alt="preview" className="img-upload__preview" />
              ) : (
                <div className="img-upload__placeholder">
                  <ImagePlus size={28} />
                  <span>Photo du produit</span>
                </div>
              )}
              <input id="product-img" type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>

            <label className="field">
              <span className="field__label">Nom du produit</span>
              <input type="text" className="field__input" placeholder="Ex: Harissa" value={name} onChange={e => setName(e.target.value)} />
            </label>

            <div className="field-row">
              <label className="field">
                <span className="field__label">Prix / Pièce (TND)</span>
                <input type="number" step="0.001" className="field__input" placeholder="0.000" value={pricePiece} onChange={e => setPricePiece(e.target.value)} />
              </label>
              <label className="field">
                <span className="field__label">Prix / Box (TND)</span>
                <input type="number" step="0.001" className="field__input" placeholder="0.000" value={priceBox} onChange={e => setPriceBox(e.target.value)} />
              </label>
            </div>

            <label className="field">
              <span className="field__label">Pièces par box</span>
              <input type="number" className="field__input" value={piecesPerBox} onChange={e => setPiecesPerBox(e.target.value)} />
            </label>
          </div>
        </div>
        <footer className="modal__foot">
          <button className="btn btn-primary foot__btn" disabled={!name || !pricePiece} onClick={handleSubmit}>
            <PlusCircle size={20} /> Ajouter
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ─── SETTINGS MODAL ─── */
function SettingsModal({ catalog, onClose, onSave, onDelete }) {
  const [editCatalog, setEditCatalog] = useState(catalog.map(p => ({ ...p })));

  const updateField = (id, field, value) => {
    setEditCatalog(prev => prev.map(p => p.id === id ? { ...p, [field]: parseFloat(value) || 0 } : p));
  };

  return (
    <div className="overlay fade-in" onClick={onClose}>
      <div className="modal slide-up" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle" />
        <header className="modal__head">
          <h2>Paramètres Produits</h2>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </header>
        <div className="modal__body">
          <div className="settings-list">
            {editCatalog.map(p => (
              <div key={p.id} className="settings-item">
                <div className="settings-item__top">
                  {p.img && <img src={p.img} alt={p.name} className="settings-item__img" />}
                  <span className="settings-item__name">{p.name}</span>
                  <button className="settings-item__del" onClick={() => {
                    setEditCatalog(prev => prev.filter(x => x.id !== p.id));
                  }}><Trash2 size={16} /></button>
                </div>
                <div className="field-row">
                  <label className="field field--sm">
                    <span className="field__label">Prix/pc</span>
                    <input type="number" step="0.001" className="field__input" value={p.pricePiece} onChange={e => updateField(p.id, 'pricePiece', e.target.value)} />
                  </label>
                  <label className="field field--sm">
                    <span className="field__label">Prix/box</span>
                    <input type="number" step="0.001" className="field__input" value={p.priceBox} onChange={e => updateField(p.id, 'priceBox', e.target.value)} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        <footer className="modal__foot">
          <button className="btn btn-primary foot__btn" onClick={() => { onSave(editCatalog); onClose(); }}>
            <Save size={20} /> Enregistrer
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ─── MANAGE CUSTOMERS MODAL ─── */
function ManageCustomersModal({ customers, onClose, onSave }) {
  const [list, setList] = useState([...customers]);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [coords, setCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Helper: update list AND immediately sync to parent
  const updateList = (newList) => {
    setList(newList);
    onSave(newList);
  };

  const handleGetLocation = () => {
    setGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsLoading(false);
        },
        (err) => {
          alert("Impossible d'obtenir la position. Veuillez autoriser le GPS.");
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      alert("La géolocalisation n'est pas supportée.");
      setGpsLoading(false);
    }
  };

  const handleAdd = () => {
    if (!newName) return;
    
    const finalLat = coords ? coords.lat : 36.8 + (Math.random() * 0.05 - 0.025);
    const finalLng = coords ? coords.lng : 10.18 + (Math.random() * 0.05 - 0.025);

    const newCust = {
      id: Date.now(),
      name: newName,
      address: newAddress || (coords ? 'Position GPS' : 'Tunis'),
      lat: finalLat,
      lng: finalLng
    };
    
    updateList([...list, newCust]);
    setNewName('');
    setNewAddress('');
    setCoords(null);
  };

  const handleDelete = (id) => {
    updateList(list.filter(x => x.id !== id));
  };

  return (
    <div className="overlay fade-in" onClick={onClose}>
      <div className="modal slide-up" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle" />
        <header className="modal__head">
          <h2>Gérer Clients</h2>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </header>
        <div className="modal__body">
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="field">
              <span className="field__label">Nouveau Client</span>
              <input type="text" className="field__input" placeholder="Nom du client" value={newName} onChange={e => setNewName(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">Adresse (Optionnel)</span>
              <input type="text" className="field__input" placeholder="Adresse" value={newAddress} onChange={e => setNewAddress(e.target.value)} />
            </label>
            
            <button 
              className="btn" 
              style={{ width: '100%', marginBottom: 12, backgroundColor: coords ? '#10b981' : '#334155', color: '#fff', border: 'none' }}
              onClick={handleGetLocation}
            >
              <MapPin size={16} /> {gpsLoading ? 'Recherche...' : coords ? 'Position Capturée ✅' : 'Capturer Position GPS Actuelle'}
            </button>

            <button className="btn btn-secondary" onClick={handleAdd} disabled={!newName} style={{ width: '100%' }}>
              + Ajouter Client
            </button>
          </div>

          <h3 className="sheet__title" style={{ marginTop: 24 }}>Clients Existants</h3>
          <div className="settings-list">
            {list.map(c => (
              <div key={c.id} className="settings-item">
                <div className="settings-item__top" style={{ marginBottom: 0 }}>
                  <div style={{ flex: 1 }}>
                    <span className="settings-item__name">{c.name}</span>
                    <span className="chip__addr" style={{ display: 'block', marginTop: 4 }}>{c.address}</span>
                  </div>
                  <button className="settings-item__del" onClick={() => handleDelete(c.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <footer className="modal__foot">
          <button className="btn btn-primary foot__btn" onClick={onClose}>
            <Save size={20} /> Fermer
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ─── INVOICE / FACTURE VIEW ─── */
function InvoiceView({ basket, customer, catalog, onBack, onSaveInvoice }) {
  const lines = Object.entries(basket).map(([id, qty]) => {
    const p = catalog.find(x => x.id === id);
    if (!p) return null;
    const sub = (qty.pieces * p.pricePiece) + (qty.boxes * p.priceBox);
    return { ...p, ...qty, subtotal: sub };
  }).filter(Boolean);

  const total = lines.reduce((s, l) => s + l.subtotal, 0);
  const [invoiceNum] = useState(() => Math.floor(Math.random() * 9000 + 1000));
  const [saved, setSaved] = useState(false);
  const now = new Date();

  const handleSave = () => {
    if (saved) return;
    const invoice = {
      invoiceNum,
      customer: customer?.name || 'Sans client',
      items: lines.map(l => ({ name: l.name, pieces: l.pieces, boxes: l.boxes, subtotal: l.subtotal })),
      total,
      timestamp: Date.now(),
      date: now.toLocaleDateString('fr-TN'),
      time: now.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })
    };
    onSaveInvoice(invoice);
    setSaved(true);
  };

  return (
    <div className="invoice fade-in">
      <div className="invoice__header">
        <h2 className="invoice__brand">Ouni</h2>
        <p className="invoice__meta">Facture #{invoiceNum}</p>
        <p className="invoice__meta">{now.toLocaleDateString('fr-TN')} — {now.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}</p>
        {customer && <p className="invoice__client">Client: {customer.name}</p>}
      </div>

      <table className="invoice__table">
        <thead>
          <tr><th>Produit</th><th>Pièces</th><th>Box</th><th>Sous-total</th></tr>
        </thead>
        <tbody>
          {lines.map(l => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.pieces > 0 ? `${l.pieces} × ${l.pricePiece.toFixed(3)}` : '—'}</td>
              <td>{l.boxes > 0 ? `${l.boxes} × ${l.priceBox.toFixed(3)}` : '—'}</td>
              <td className="invoice__num">{l.subtotal.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice__total-row">
        <span>Total à payer</span>
        <span className="invoice__total-val">{total.toFixed(3)} TND</span>
      </div>

      <div className="invoice__actions">
        <button className="btn btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Retour</button>
        <button className="btn" style={{ backgroundColor: saved ? '#10b981' : '#3b82f6', color: '#fff' }} onClick={handleSave}>
          <Save size={16} /> {saved ? 'Enregistré ✅' : 'Enregistrer'}
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}><Printer size={16} /> Imprimer</button>
      </div>
    </div>
  );
}

/* ─── DASHBOARD MODAL ─── */
function DashboardModal({ onClose }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices().then(data => { setInvoices(data); setLoading(false); });
  }, []);

  const today = new Date().toLocaleDateString('fr-TN');
  const todayInvoices = invoices.filter(inv => inv.date === today);
  const todayTotal = todayInvoices.reduce((s, inv) => s + inv.total, 0);
  const allTimeTotal = invoices.reduce((s, inv) => s + inv.total, 0);

  return (
    <div className="overlay fade-in" onClick={onClose}>
      <div className="modal slide-up" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle" />
        <header className="modal__head">
          <h2>Tableau de Bord</h2>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </header>
        <div className="modal__body">
          {loading ? <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>Chargement...</p> : (
            <>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: 16, padding: 20, color: '#fff' }}>
                  <DollarSign size={24} style={{ opacity: 0.7, marginBottom: 8 }} />
                  <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: 4 }}>Revenu Aujourd'hui</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{todayTotal.toFixed(3)}</p>
                  <p style={{ fontSize: '0.7rem', opacity: 0.7 }}>TND</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #065f46, #10b981)', borderRadius: 16, padding: 20, color: '#fff' }}>
                  <FileText size={24} style={{ opacity: 0.7, marginBottom: 8 }} />
                  <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: 4 }}>Factures Aujourd'hui</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{todayInvoices.length}</p>
                  <p style={{ fontSize: '0.7rem', opacity: 0.7 }}>factures</p>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Général ({invoices.length} factures)</span>
                <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '1.1rem' }}>{allTimeTotal.toFixed(3)} TND</span>
              </div>

              {/* Invoice History */}
              <h3 className="sheet__title" style={{ marginBottom: 12 }}><Clock size={14} /> Historique des Factures</h3>
              <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                {invoices.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>Aucune facture enregistrée</p>
                ) : (
                  invoices.map((inv, i) => (
                    <div key={inv.id || i} style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 8,
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>#{inv.invoiceNum}</span>
                        <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>{inv.total.toFixed(3)} TND</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>{inv.customer}</span>
                        <span>{inv.date} {inv.time}</span>
                      </div>
                      <div style={{ marginTop: 6, fontSize: '0.7rem', color: '#475569' }}>
                        {inv.items?.map((it, j) => <span key={j} style={{ marginRight: 8 }}>{it.name} ({it.pieces > 0 ? `${it.pieces}pc` : ''}{it.pieces > 0 && it.boxes > 0 ? '+' : ''}{it.boxes > 0 ? `${it.boxes}bx` : ''})</span>)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
        <footer className="modal__foot">
          <button className="btn btn-primary foot__btn" onClick={onClose}>
            <X size={20} /> Fermer
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ─── MAIN APP ─── */
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [dbLoading, setDbLoading] = useState(true);
  const [catalog, setCatalog] = useState([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showManageCustomers, setShowManageCustomers] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [basket, setBasket] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const geoControlRef = useRef(null);
  const mapRef = useRef(null);

  // Fetch data
  useEffect(() => {
    async function initDB() {
      const [catData, custData] = await Promise.all([
        fetchCatalogFromCloud(DEFAULT_CATALOG),
        fetchCustomersFromCloud(DEFAULT_CUSTOMERS)
      ]);
      setCatalog(catData);
      setCustomers(custData);
      setDbLoading(false);
    }
    initDB();
  }, []);

  // Persist data mutations
  useEffect(() => { if (!dbLoading) saveCatalogToCloud(catalog); }, [catalog, dbLoading]);
  useEffect(() => { if (!dbLoading) saveCustomersToCloud(customers); }, [customers, dbLoading]);

  const sortedCustomers = useMemo(() => {
    if (!userLocation) return customers;
    return [...customers].sort((a, b) => {
      const distA = Math.pow(userLocation.lat - a.lat, 2) + Math.pow(userLocation.lng - a.lng, 2);
      const distB = Math.pow(userLocation.lat - b.lat, 2) + Math.pow(userLocation.lng - b.lng, 2);
      return distA - distB;
    });
  }, [customers, userLocation]);

  const fetchRoute = async (client) => {
    if (!userLocation) {
      alert("En attente de votre position GPS locale...");
      return;
    }
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${client.lng},${client.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        setRouteData(data.routes[0].geometry);
        // Enter Drive Mode
        mapRef.current?.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 17,
          pitch: 65,
          bearing: 0,
          padding: { bottom: 350 }, // Shift view up past the bottom sheet
          duration: 2500
        });
      }
    } catch (err) {
      console.error(err);
      alert("Impossible de calculer l'itinéraire.");
    }
  };

  const updateQuantity = (productId, type, delta) => {
    setBasket(prev => {
      const cur = prev[productId] || { pieces: 0, boxes: 0 };
      const val = Math.max(0, cur[type] + delta);
      const next = { ...prev, [productId]: { ...cur, [type]: val } };
      if (next[productId].pieces === 0 && next[productId].boxes === 0) delete next[productId];
      return next;
    });
  };

  const clearBasket = () => setBasket({});

  const { totalItems, grandTotal } = useMemo(() => {
    let items = 0, total = 0;
    Object.entries(basket).forEach(([id, qty]) => {
      const p = catalog.find(x => x.id === id);
      if (p) { items += qty.pieces + qty.boxes; total += qty.pieces * p.pricePiece + qty.boxes * p.priceBox; }
    });
    return { totalItems: items, grandTotal: total.toFixed(3) };
  }, [basket, catalog]);

  const openBasket = (c = null) => { if (c) setSelectedCustomer(c); setIsBasketOpen(true); setShowInvoice(false); };

  const handleAddProduct = useCallback((product) => {
    setCatalog(prev => [...prev, product]);
  }, []);

  const handleSaveCatalog = useCallback((updated) => {
    setCatalog(updated);
  }, []);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;

  return (
    <div className="app">
      {/* ── HEADER ── */}
      <header className="header fade-in">
        <div className="header__brand"><img src="/logo.png" alt="Ouni Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} /><span>Ouni</span></div>
        <div className="header__actions">
          <button className="header__btn" onClick={() => setShowDashboard(true)} title="Tableau de Bord">
            <BarChart3 size={18} />
          </button>
          <button className="header__btn" onClick={() => setShowSettings(true)} title="Paramètres">
            <Settings size={18} />
          </button>
          <button className="header__btn" onClick={() => setShowManageCustomers(true)} title="Gérer Clients">
            <Users size={18} />
          </button>
          <button className="header__btn" onClick={() => setShowAddProduct(true)} title="Ajouter produit">
            <PlusCircle size={18} />
          </button>
          <button className="header__cart badge-wrap" onClick={() => openBasket()}>
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="badge">{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* ── MAP ── */}
      <main className="main">
        <Map
          ref={mapRef}
          initialViewState={{ longitude: 10.1815, latitude: 36.8065, zoom: 13 }}
          mapStyle={`https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
          onLoad={() => {
            // Automatically start tracking
            setTimeout(() => geoControlRef.current?.trigger(), 1000);
          }}
        >
          <GeolocateControl 
            ref={geoControlRef}
            position="bottom-right" 
            trackUserLocation 
            showUserLocation 
            showUserHeading 
            positionOptions={{ enableHighAccuracy: true }} 
            onGeolocate={(e) => setUserLocation({ lat: e.coords.latitude, lng: e.coords.longitude })}
          />
          {customers.map(c => (
            <Marker key={c.id} longitude={c.lng} latitude={c.lat} anchor="bottom">
              <div className="pin" onClick={() => openBasket(c)}>
                <MapPin size={28} color="#fff" fill="#3b82f6" />
                <span className="pin__label">{c.name}</span>
              </div>
            </Marker>
          ))}

          {routeData && (
            <Source id="route-source" type="geojson" data={{ type: 'Feature', properties: {}, geometry: routeData }}>
              <Layer
                id="route-line"
                type="line"
                layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                paint={{ 'line-color': '#00e5ff', 'line-width': 6, 'line-opacity': 0.8 }}
              />
            </Source>
          )}
        </Map>

        <div className="bottom-sheet">
          <div className="sheet__handle" />
          <h3 className="sheet__title">Clients</h3>
          <div className="sheet__scroll">
            {sortedCustomers.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 8 }}>
                <button 
                  className="chip" 
                  style={{ flex: 1 }}
                  onClick={() => openBasket(c)}
                >
                  <div><span className="chip__name">{c.name}</span><span className="chip__addr">{c.address}</span></div>
                </button>
                <button 
                  className="chip" 
                  style={{ flex: '0 0 auto', justifyContent: 'center', background: '#3b82f6', color: '#fff' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchRoute(c);
                  }}
                >
                  <Navigation size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── POS MODAL ── */}
      {isBasketOpen && (
        <div className="overlay fade-in" onClick={() => setIsBasketOpen(false)}>
          <div className="modal slide-up" onClick={e => e.stopPropagation()}>
            <div className="sheet__handle" />
            <header className="modal__head">
              <div>
                <h2>{showInvoice ? 'Facture' : 'Panier'}</h2>
                {selectedCustomer && <p className="modal__client">{selectedCustomer.name}</p>}
              </div>
              <button className="close-btn" onClick={() => setIsBasketOpen(false)}><X size={22} /></button>
            </header>

            <div className="modal__body">
              {showInvoice ? (
                <InvoiceView basket={basket} customer={selectedCustomer} catalog={catalog} onBack={() => setShowInvoice(false)} onSaveInvoice={saveInvoice} />
              ) : (
                <div className="products">
                  {[...catalog].sort((a, b) => {
                    const qa = (basket[a.id]?.pieces || 0) + (basket[a.id]?.boxes || 0);
                    const qb = (basket[b.id]?.pieces || 0) + (basket[b.id]?.boxes || 0);
                    return qb - qa;
                  }).map(product => {
                    const b = basket[product.id] || { pieces: 0, boxes: 0 };
                    return (
                      <div key={product.id} className="p-card">
                        <div className="p-card__top">
                          {product.img && <img className="p-card__img" src={product.img} alt={product.name} />}
                          <div className="p-card__info">
                            <span className="p-card__name">{product.name}</span>
                            <div className="p-card__tags">
                              <span className="tag">{product.pricePiece.toFixed(3)} /pc</span>
                              <span className="tag tag--box">{product.priceBox.toFixed(3)} /box</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-card__bottom">
                          <div className="qty">
                            <span className="qty__label">Pièce</span>
                            <div className="stepper">
                              <button className="s-btn" onClick={() => updateQuantity(product.id, 'pieces', -1)}><Minus size={14} /></button>
                              <span className="s-val">{b.pieces}</span>
                              <button className="s-btn s-btn--plus" onClick={() => updateQuantity(product.id, 'pieces', 1)}><Plus size={14} /></button>
                            </div>
                          </div>
                          <div className="qty">
                            <span className="qty__label">Box</span>
                            <div className="stepper">
                              <button className="s-btn" onClick={() => updateQuantity(product.id, 'boxes', -1)}><Minus size={14} /></button>
                              <span className="s-val">{b.boxes}</span>
                              <button className="s-btn s-btn--plus" onClick={() => updateQuantity(product.id, 'boxes', 1)}><Plus size={14} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!showInvoice && (
              <footer className="modal__foot">
                <div className="foot__row">
                  <div>
                    <span className="foot__label">Total</span>
                    {totalItems > 0 && <button className="foot__clear" onClick={clearBasket}><Trash2 size={14} /> Vider</button>}
                  </div>
                  <span className="foot__amount">{grandTotal} <small>TND</small></span>
                </div>
                <button className="btn btn-primary foot__btn" disabled={totalItems === 0} onClick={() => setShowInvoice(true)}>
                  <FileText size={20} /> Générer Facture
                </button>
              </footer>
            )}
          </div>
        </div>
      )}

      {/* ── ADD PRODUCT MODAL ── */}
      {showAddProduct && (
        <AddProductModal onClose={() => setShowAddProduct(false)} onAdd={handleAddProduct} />
      )}

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <SettingsModal catalog={catalog} onClose={() => setShowSettings(false)} onSave={handleSaveCatalog} />
      )}

      {/* ── MANAGE CUSTOMERS MODAL ── */}
      {showManageCustomers && (
        <ManageCustomersModal customers={customers} onClose={() => setShowManageCustomers(false)} onSave={setCustomers} />
      )}

      {/* ── DASHBOARD MODAL ── */}
      {showDashboard && (
        <DashboardModal onClose={() => setShowDashboard(false)} />
      )}
    </div>
  );
}

export default App;
