import { db, hasFirebase } from './firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, addDoc, query, orderBy } from 'firebase/firestore';

export async function fetchCatalogFromCloud(defaultCatalog) {
  if (!hasFirebase) {
    console.log("[db] Using LocalStorage for Catalog (Firebase keys not provided)");
    try {
      const saved = localStorage.getItem('ouni_catalog_v5');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultCatalog;
  }
  
  try {
    console.log("[db] Fetching Catalog from Firebase Cloud...");
    const snap = await getDocs(collection(db, 'catalog'));
    if (snap.empty) {
      console.log("[db] Cloud catalog empty, uploading defaults...");
      await saveCatalogToCloud(defaultCatalog);
      return defaultCatalog;
    }
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error("[db] Firebase read error, falling back to defaults:", err);
    return defaultCatalog;
  }
}

export async function saveCatalogToCloud(catalog) {
  if (!hasFirebase) {
    localStorage.setItem('ouni_catalog_v5', JSON.stringify(catalog));
    return;
  }
  
  try {
    // Get existing docs to find deletions
    const snap = await getDocs(collection(db, 'catalog'));
    const existingIds = new Set(snap.docs.map(d => d.id));
    const newIds = new Set(catalog.map(item => String(item.id)));
    
    // Delete removed items
    const deletes = [...existingIds].filter(id => !newIds.has(id)).map(id => deleteDoc(doc(db, 'catalog', id)));
    // Upsert current items
    const writes = catalog.map(item => setDoc(doc(db, 'catalog', String(item.id)), item));
    
    await Promise.all([...deletes, ...writes]);
    console.log(`[db] Catalog synced: ${writes.length} written, ${deletes.length} deleted`);
  } catch (e) {
    console.error("Error saving catalog to cloud:", e);
  }
}

export async function fetchCustomersFromCloud(defaultCustomers) {
  if (!hasFirebase) {
    console.log("[db] Using LocalStorage for Customers (Firebase keys not provided)");
    try {
      const saved = localStorage.getItem('ouni_customers_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultCustomers;
  }
  
  try {
    console.log("[db] Fetching Customers from Firebase Cloud...");
    const snap = await getDocs(collection(db, 'customers'));
    if (snap.empty) {
      await saveCustomersToCloud(defaultCustomers);
      return defaultCustomers;
    }
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error("[db] Firebase read error, falling back to defaults:", err);
    return defaultCustomers;
  }
}

export async function saveCustomersToCloud(customers) {
  if (!hasFirebase) {
    localStorage.setItem('ouni_customers_v2', JSON.stringify(customers));
    return;
  }
  
  try {
    // Get existing docs to find deletions
    const snap = await getDocs(collection(db, 'customers'));
    const existingIds = new Set(snap.docs.map(d => d.id));
    const newIds = new Set(customers.map(c => String(c.id)));
    
    // Delete removed customers
    const deletes = [...existingIds].filter(id => !newIds.has(id)).map(id => deleteDoc(doc(db, 'customers', id)));
    // Upsert current customers
    const writes = customers.map(c => setDoc(doc(db, 'customers', String(c.id)), c));
    
    await Promise.all([...deletes, ...writes]);
    console.log(`[db] Customers synced: ${writes.length} written, ${deletes.length} deleted`);
  } catch (e) {
    console.error("Error saving customers to cloud:", e);
  }
}

export async function saveInvoice(invoice) {
  if (!hasFirebase) {
    try {
      const saved = JSON.parse(localStorage.getItem('ouni_invoices') || '[]');
      saved.unshift(invoice);
      localStorage.setItem('ouni_invoices', JSON.stringify(saved));
    } catch (e) {}
    return;
  }

  try {
    await addDoc(collection(db, 'invoices'), invoice);
    console.log("[db] Invoice saved to cloud");
  } catch (e) {
    console.error("Error saving invoice:", e);
  }
}

export async function fetchInvoices() {
  if (!hasFirebase) {
    try {
      return JSON.parse(localStorage.getItem('ouni_invoices') || '[]');
    } catch (e) {}
    return [];
  }

  try {
    const snap = await getDocs(collection(db, 'invoices'));
    const invoices = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort by timestamp descending (newest first)
    invoices.sort((a, b) => b.timestamp - a.timestamp);
    return invoices;
  } catch (e) {
    console.error("Error fetching invoices:", e);
    return [];
  }
}
