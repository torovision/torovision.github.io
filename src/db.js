import { db, hasFirebase } from './firebase';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';

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
      // Fire & forget upload
      saveCatalogToCloud(defaultCatalog);
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
  
  Promise.all(catalog.map(item => 
    setDoc(doc(db, 'catalog', String(item.id)), item)
  )).catch(e => console.error("Error saving catalog to cloud:", e));
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
      // Fire & forget upload
      saveCustomersToCloud(defaultCustomers);
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
  
  Promise.all(customers.map(c => 
    setDoc(doc(db, 'customers', String(c.id)), c)
  )).catch(e => console.error("Error saving customers to cloud:", e));
}
