import { useState, useMemo, useEffect, useCallback } from 'react';
import './App.css';
import { ShoppingCart, MapPin, Plus, Minus, X, Trash2, ArrowLeft, Navigation, FileText, Printer, Settings, PlusCircle, Save, ImagePlus, Pencil, Users } from 'lucide-react';
import Map, { Marker, GeolocateControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';

// Configure MapLibre RTL Plugin for Arabic text rendering
maplibregl.setRTLTextPlugin(
  'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
  null,
  true // Lazy load the plugin
);

const MAPTILER_KEY = 'XJjj2pOhjNSZrecDvLx8';

const IMG = (name) => `/product images/${name}`;

const DEFAULT_CATALOG = [
  { id: 'p1',  name: '1 Kg Mozzarilla Rappé',        pricePiece: 12.000, priceBox: 12.000,   piecesPerBox: 12, img: IMG('1 kg mozzarilla rappé.jpg') },
  { id: 'p2',  name: 'Canicha',                      pricePiece: 3.800,  priceBox: 3.800,    piecesPerBox: 12, img: IMG('Canicha.png') },
  { id: 'p3',  name: 'Fraidoux',                     pricePiece: 3.000,  priceBox: 3.000,    piecesPerBox: 12, img: IMG('Fraidoux.jpg') },
  { id: 'p4',  name: 'Thon Sidi Ali 140g',           pricePiece: 2.900,  priceBox: 69.600,   piecesPerBox: 24, img: IMG('THON_HV_140_GR_SIDI_ALI.png') },
  { id: 'p5',  name: 'Carrés Président',             pricePiece: 10.000, priceBox: 10.000,   piecesPerBox: 12, img: IMG('carrés president.jpg') },
  { id: 'p6',  name: 'Goûter',                       pricePiece: 34.000, priceBox: 34.000,   piecesPerBox: 12, img: IMG('gouter.png') },
  { id: 'p7',  name: 'Gruyère',                      pricePiece: 22.000, priceBox: 22.000,   piecesPerBox: 12, img: IMG('gruyére.png') },
  { id: 'p8',  name: 'Harissa',                      pricePiece: 27.000, priceBox: 27.000,   piecesPerBox: 12, img: IMG('harissa.png') },
  { id: 'p9',  name: 'Jambon de Dinde Mazraa',       pricePiece: 12.000, priceBox: 12.000,   piecesPerBox: 12, img: IMG('jambon-de-dinde mazraa.png') },
  { id: 'p10', name: 'Jambon Maraii',                 pricePiece: 12.000, priceBox: 12.000,   piecesPerBox: 12, img: IMG('jombon maraii.jpg') },
  { id: 'p11', name: 'Maraii Kids',                   pricePiece: 1.500,  priceBox: 42.000,   piecesPerBox: 12, img: IMG('maraii kids.png') },
  { id: 'p12', name: 'Mozzapizza',                   pricePiece: 12.000, priceBox: 12.000,   piecesPerBox: 12, img: IMG('mozzapizza.jpg') },
  { id: 'p13', name: 'P48',                          pricePiece: 15.000, priceBox: 180.000,  piecesPerBox: 12, img: IMG('p48.png') },
  { id: 'p14', name: 'Rappé',                        pricePiece: 7.500,  priceBox: 7.500,    piecesPerBox: 12, img: IMG('rappé.jpg') },
  { id: 'p15', name: 'Salami El Mazraa 600g',        pricePiece: 3.500,  priceBox: 59.500,   piecesPerBox: 12, img: IMG('salami el mazraa 600 g.png') },
  { id: 'p16', name: 'Sardine',                      pricePiece: 2.000,  priceBox: 2.000,    piecesPerBox: 12, img: IMG('sardine.jpg') },
  { id: 'p17', name: 'Slice',                        pricePiece: 4.500,  priceBox: 4.500,    piecesPerBox: 12, img: IMG('slice.png') },
  { id: 'p18', name: 'Thon Sidi Ali Grand',          pricePiece: 8.500,  priceBox: 8.500,    piecesPerBox: 12, img: IMG('thon sidi ali grand.png') },
  { id: 'p19', name: 'Thonito Thon',                 pricePiece: 2.650,  priceBox: 63.600,   piecesPerBox: 24, img: IMG('thonito thon.png') },
  { id: 'p20', name: 'Harissa grand',                pricePiece: 2.400,  priceBox: 29.000,   piecesPerBox: 12, img: IMG('harissa grand.png') },
  { id: 'p21', name: 'salami Royal kids',            pricePiece: 27.000, priceBox: 27.000,   piecesPerBox: 12, img: IMG('royal-kids.png') },
  { id: 'p22', name: 'Edam cheese',                  pricePiece: 3.000,  priceBox: 42.000,   piecesPerBox: 12, img: IMG('edam cheese.png') },
  { id: 'p23', name: 'Garlic',                       pricePiece: 10.000, priceBox: 100.000,  piecesPerBox: 10, img: IMG('Normal-White-Chinese-New-Crop-Peeled-Garlic-Wholesale-Mesh-Bag-10kg-Box-Packing-Premium-Red-Garlic-Hot-Selling-in-Tunis.avif') },
  { id: 'p24', name: 'Cheddar 40g Land\'or',         pricePiece: 1.600,  priceBox: 64.000,   piecesPerBox: 40, img: IMG('Cheddar 40g Landor.jpg') },
  { id: 'p25', name: 'Rappé 4 fromage',              pricePiece: 10.000, priceBox: 10.000,   piecesPerBox: 12, img: IMG('Rappé 4 fromage.png') },
  { id: 'p26', name: 'Chamiya 5KG',                  pricePiece: 50.000, priceBox: 50.000,   piecesPerBox: 1,  img: IMG('chamiya.png') },
  { id: 'p27', name: 'Harissa Arbi 4KG',             pricePiece: 26.000, priceBox: 26.000,   piecesPerBox: 1,  img: IMG('harissa arbi.avif') },
  { id: 'p28', name: 'Fromage mozzarella tranché 1KG',pricePiece: 12.000, priceBox: 12.000,  piecesPerBox: 1,  img: IMG('fromage-mozzarella-tranché-isolé-sur-fond-blanc-avec-chemin-de-coupe-et-profondeur-champ-complète-213623048.webp') },
  { id: 'p29', name: 'TARTI FRO 80',                 pricePiece: 12.000, priceBox: 12.000,   piecesPerBox: 1,  img: IMG('Tarti Frou.jpg') },
  { id: 'p30', name: 'fromage fondu pour tartine LAND\'OR 104 g', pricePiece: 1.250, priceBox: 30.000, piecesPerBox: 24, img: IMG('front_en.36.full.jpg') },
];

/* Load catalog from localStorage or use defaults */
function loadCatalog() {
  try {
    const saved = localStorage.getItem('ouni_catalog_v4');
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return DEFAULT_CATALOG;
}

function saveCatalog(catalog) {
  localStorage.setItem('ouni_catalog_v4', JSON.stringify(catalog));
}

/* ─── CUSTOMERS MANAGEMENT ─── */
const DEFAULT_CUSTOMERS = [
  { id: 1, name: 'Boutique Alpha', lat: 36.8065, lng: 10.1815, address: 'Rue de la Liberté' },
  { id: 2, name: 'Superette Sidi', lat: 36.8123, lng: 10.1788, address: 'Avenue Habib Bourguiba' },
  { id: 3, name: 'Hanout Medina', lat: 36.8000, lng: 10.1650, address: 'La Medina' },
];

function loadCustomers() {
  try {
    const saved = localStorage.getItem('ouni_customers');
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return DEFAULT_CUSTOMERS;
}

function saveCustomers(customers) {
  localStorage.setItem('ouni_customers', JSON.stringify(customers));
}

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

  const handleAdd = () => {
    if (!newName) return;
    
    const defaultLat = 36.8 + (Math.random() * 0.05 - 0.025);
    const defaultLng = 10.18 + (Math.random() * 0.05 - 0.025);

    const saveNewClient = (lat, lng) => {
      const newCust = {
        id: Date.now(),
        name: newName,
        address: newAddress || 'Position GPS',
        lat,
        lng
      };
      setList(prev => [...prev, newCust]);
      setNewName('');
      setNewAddress('');
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => saveNewClient(pos.coords.latitude, pos.coords.longitude),
        (err) => saveNewClient(defaultLat, defaultLng),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      saveNewClient(defaultLat, defaultLng);
    }
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
                  <button className="settings-item__del" onClick={() => setList(list.filter(x => x.id !== c.id))}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <footer className="modal__foot">
          <button className="btn btn-primary foot__btn" onClick={() => { onSave(list); onClose(); }}>
            <Save size={20} /> Enregistrer
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ─── INVOICE / FACTURE VIEW ─── */
function InvoiceView({ basket, customer, catalog, onBack }) {
  const lines = Object.entries(basket).map(([id, qty]) => {
    const p = catalog.find(x => x.id === id);
    if (!p) return null;
    const sub = (qty.pieces * p.pricePiece) + (qty.boxes * p.priceBox);
    return { ...p, ...qty, subtotal: sub };
  }).filter(Boolean);

  const total = lines.reduce((s, l) => s + l.subtotal, 0);
  const now = new Date();

  return (
    <div className="invoice fade-in">
      <div className="invoice__header">
        <h2 className="invoice__brand">Ouni</h2>
        <p className="invoice__meta">Facture #{Math.floor(Math.random() * 9000 + 1000)}</p>
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
        <button className="btn btn-primary" onClick={() => window.print()}><Printer size={16} /> Imprimer</button>
      </div>
    </div>
  );
}

/* ─── MAIN APP ─── */
function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [catalog, setCatalog] = useState(loadCatalog);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showManageCustomers, setShowManageCustomers] = useState(false);
  const [customers, setCustomers] = useState(loadCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [basket, setBasket] = useState({});

  // Persist data
  useEffect(() => { saveCatalog(catalog); }, [catalog]);
  useEffect(() => { saveCustomers(customers); }, [customers]);

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
          initialViewState={{ longitude: 10.1815, latitude: 36.8065, zoom: 13 }}
          mapStyle={`https://api.maptiler.com/maps/streets-v4/style.json?key=${MAPTILER_KEY}`}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        >
          <GeolocateControl 
            position="bottom-right" 
            trackUserLocation 
            showUserLocation 
            showUserHeading 
            positionOptions={{ enableHighAccuracy: true }} 
          />
          {customers.map(c => (
            <Marker key={c.id} longitude={c.lng} latitude={c.lat} anchor="bottom">
              <div className="pin" onClick={() => openBasket(c)}>
                <MapPin size={28} color="#fff" fill="#3b82f6" />
                <span className="pin__label">{c.name}</span>
              </div>
            </Marker>
          ))}
        </Map>

        <div className="bottom-sheet">
          <div className="sheet__handle" />
          <h3 className="sheet__title">Clients</h3>
          <div className="sheet__scroll">
            {customers.map(c => (
              <button key={c.id} className="chip" onClick={() => openBasket(c)}>
                <Navigation size={16} className="chip__icon" />
                <div><span className="chip__name">{c.name}</span><span className="chip__addr">{c.address}</span></div>
              </button>
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
                <InvoiceView basket={basket} customer={selectedCustomer} catalog={catalog} onBack={() => setShowInvoice(false)} />
              ) : (
                <div className="products">
                  {catalog.map(product => {
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
    </div>
  );
}

export default App;
