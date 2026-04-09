import { db, hasFirebase } from './firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

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
