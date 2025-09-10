// TripSync Storage Manager
// Handles all data persistence with IndexedDB and localStorage fallback

class StorageManager {
    constructor() {
        this.dbName = 'TripSyncDB';
        this.dbVersion = 1;
        this.db = null;
        this.isIndexedDBAvailable = this.checkIndexedDB();
        this.prefix = 'tripsync_';
        
        if (this.isIndexedDBAvailable) {
            this.initDB();
        }
    }
    
    // Check if IndexedDB is available
    checkIndexedDB() {
        try {
            if (!window.indexedDB) return false;
            // Test if we can actually use it (some browsers block in private mode)
            const test = window.indexedDB.open('test');
            test.onsuccess = () => {
                test.result.close();
                window.indexedDB.deleteDatabase('test');
            };
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Initialize IndexedDB
    async initDB() {
        return new Promise((resolve, reject) => {
            if (!this.isIndexedDBAvailable) {
                resolve(false);
                return;
            }
            
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                this.isIndexedDBAvailable = false;
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                
                // Handle database errors
                this.db.onerror = (event) => {
                    console.error('Database error:', event.target.error);
                };
                
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                const stores = [
                    { name: 'trips', keyPath: 'id', indexes: [
                        { name: 'status', keyPath: 'status', unique: false },
                        { name: 'startDate', keyPath: 'startDate', unique: false },
                        { name: 'destination', keyPath: 'destination', unique: false }
                    ]},
                    { name: 'activities', keyPath: 'id', indexes: [
                        { name: 'tripId', keyPath: 'tripId', unique: false },
                        { name: 'date', keyPath: 'date', unique: false },
                        { name: 'category', keyPath: 'category', unique: false }
                    ]},
                    { name: 'expenses', keyPath: 'id', indexes: [
                        { name: 'tripId', keyPath: 'tripId', unique: false },
                        { name: 'category', keyPath: 'category', unique: false },
                        { name: 'date', keyPath: 'date', unique: false }
                    ]},
                    { name: 'documents', keyPath: 'id', indexes: [
                        { name: 'tripId', keyPath: 'tripId', unique: false },
                        { name: 'type', keyPath: 'type', unique: false }
                    ]},
                    { name: 'checklists', keyPath: 'id', indexes: [
                        { name: 'tripId', keyPath: 'tripId', unique: false },
                        { name: 'category', keyPath: 'category', unique: false }
                    ]},
                    { name: 'preferences', keyPath: 'key' },
                    { name: 'cache', keyPath: 'key', indexes: [
                        { name: 'expires', keyPath: 'expires', unique: false }
                    ]}
                ];
                
                stores.forEach(storeConfig => {
                    if (!db.objectStoreNames.contains(storeConfig.name)) {
                        const store = db.createObjectStore(storeConfig.name, { 
                            keyPath: storeConfig.keyPath 
                        });
                        
                        // Create indexes
                        if (storeConfig.indexes) {
                            storeConfig.indexes.forEach(index => {
                                store.createIndex(index.name, index.keyPath, { 
                                    unique: index.unique 
                                });
                            });
                        }
                    }
                });
            };
        });
    }
    
    // Wait for database to be ready
    async ensureDB() {
        if (this.db) return this.db;
        if (this.isIndexedDBAvailable) {
            return await this.initDB();
        }
        return null;
    }
    
    // Save data
    async save(storeName, data) {
        // Try IndexedDB first
        if (this.isIndexedDBAvailable) {
            try {
                await this.ensureDB();
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                return new Promise((resolve, reject) => {
                    const request = store.put(data);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => {
                        console.error('IndexedDB save error:', request.error);
                        // Fallback to localStorage
                        this.saveToLocalStorage(storeName, data);
                        resolve(data.id);
                    };
                });
            } catch (error) {
                console.error('Save error:', error);
                // Fallback to localStorage
                return this.saveToLocalStorage(storeName, data);
            }
        } else {
            // Use localStorage
            return this.saveToLocalStorage(storeName, data);
        }
    }
    
    // Save to localStorage (fallback)
    saveToLocalStorage(storeName, data) {
        try {
            const key = `${this.prefix}${storeName}`;
            let items = this.getFromLocalStorage(storeName);
            
            // Update or add item
            const index = items.findIndex(item => item.id === data.id);
            if (index > -1) {
                items[index] = data;
            } else {
                items.push(data);
            }
            
            localStorage.setItem(key, JSON.stringify(items));
            return data.id;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            }
            throw error;
        }
    }
    
    // Get single item
    async get(storeName, id) {
        if (this.isIndexedDBAvailable) {
            try {
                await this.ensureDB();
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                
                return new Promise((resolve, reject) => {
                    const request = store.get(id);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => {
                        console.error('IndexedDB get error:', request.error);
                        // Fallback to localStorage
                        const items = this.getFromLocalStorage(storeName);
                        resolve(items.find(item => item.id === id));
                    };
                });
            } catch (error) {
                console.error('Get error:', error);
                const items = this.getFromLocalStorage(storeName);
                return items.find(item => item.id === id);
            }
        } else {
            const items = this.getFromLocalStorage(storeName);
            return items.find(item => item.id === id);
        }
    }
    
    // Get all items
    async getAll(storeName) {
        if (this.isIndexedDBAvailable) {
            try {
                await this.ensureDB();
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                
                return new Promise((resolve, reject) => {
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result || []);
                    request.onerror = () => {
                        console.error('IndexedDB getAll error:', request.error);
                        // Fallback to localStorage
                        resolve(this.getFromLocalStorage(storeName));
                    };
                });
            } catch (error) {
                console.error('GetAll error:', error);
                return this.getFromLocalStorage(storeName);
            }
        } else {
            return this.getFromLocalStorage(storeName);
        }
    }
    
    // Get from localStorage
    getFromLocalStorage(storeName) {
        try {
            const key = `${this.prefix}${storeName}`;
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('localStorage get error:', error);
            return [];
        }
    }
    
    // Query with index
    async query(storeName, indexName, value) {
        if (!this.isIndexedDBAvailable) {
            // Fallback for localStorage
            const items = this.getFromLocalStorage(storeName);
            return items.filter(item => item[indexName] === value);
        }
        
        try {
            await this.ensureDB();
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            
            return new Promise((resolve, reject) => {
                const request = index.getAll(value);
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => {
                    console.error('Query error:', request.error);
                    // Fallback
                    const items = this.getFromLocalStorage(storeName);
                    resolve(items.filter(item => item[indexName] === value));
                };
            });
        } catch (error) {
            console.error('Query error:', error);
            const items = this.getFromLocalStorage(storeName);
            return items.filter(item => item[indexName] === value);
        }
    }
    
    // Delete item
    async delete(storeName, id) {
        if (this.isIndexedDBAvailable) {
            try {
                await this.ensureDB();
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                return new Promise((resolve, reject) => {
                    const request = store.delete(id);
                    request.onsuccess = () => {
                        resolve(true);
                        // Also remove from localStorage
                        this.deleteFromLocalStorage(storeName, id);
                    };
                    request.onerror = () => {
                        console.error('Delete error:', request.error);
                        this.deleteFromLocalStorage(storeName, id);
                        resolve(true);
                    };
                });
            } catch (error) {
                console.error('Delete error:', error);
                return this.deleteFromLocalStorage(storeName, id);
            }
        } else {
            return this.deleteFromLocalStorage(storeName, id);
        }
    }
    
    // Delete from localStorage
    deleteFromLocalStorage(storeName, id) {
        try {
            const key = `${this.prefix}${storeName}`;
            let items = this.getFromLocalStorage(storeName);
            items = items.filter(item => item.id !== id);
            localStorage.setItem(key, JSON.stringify(items));
            return true;
        } catch (error) {
            console.error('localStorage delete error:', error);
            return false;
        }
    }
    
    // Clear store
    async clear(storeName) {
        if (this.isIndexedDBAvailable) {
            try {
                await this.ensureDB();
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                return new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => {
                        resolve(true);
                        // Also clear localStorage
                        this.clearLocalStorage(storeName);
                    };
                    request.onerror = () => {
                        console.error('Clear error:', request.error);
                        this.clearLocalStorage(storeName);
                        resolve(true);
                    };
                });
            } catch (error) {
                console.error('Clear error:', error);
                return this.clearLocalStorage(storeName);
            }
        } else {
            return this.clearLocalStorage(storeName);
        }
    }
    
    // Clear localStorage
    clearLocalStorage(storeName) {
        try {
            const key = `${this.prefix}${storeName}`;
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('localStorage clear error:', error);
            return false;
        }
    }
    
    // Clear all data
    async clearAll() {
        if (this.isIndexedDBAvailable) {
            try {
                await this.ensureDB();
                const stores = ['trips', 'activities', 'expenses', 'documents', 'checklists', 'preferences', 'cache'];
                
                for (const storeName of stores) {
                    await this.clear(storeName);
                }
                
                return true;
            } catch (error) {
                console.error('Clear all error:', error);
                this.clearAllLocalStorage();
                return true;
            }
        } else {
            return this.clearAllLocalStorage();
        }
    }
    
    // Clear all localStorage
    clearAllLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Clear all localStorage error:', error);
            return false;
        }
    }
    
    // Handle storage quota exceeded
    handleStorageQuotaExceeded() {
        console.warn('Storage quota exceeded');
        
        // Try to clean up old cache entries
        this.cleanupCache();
        
        // Notify user
        if (window.showToast) {
            window.showToast('Storage space is running low. Some old data may be removed.', 'warning');
        }
    }
    
    // Cleanup old cache entries
    async cleanupCache() {
        const now = Date.now();
        
        if (this.isIndexedDBAvailable) {
            try {
                await this.ensureDB();
                const transaction = this.db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const index = store.index('expires');
                
                const range = IDBKeyRange.upperBound(now);
                const request = index.openCursor(range);
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        store.delete(cursor.primaryKey);
                        cursor.continue();
                    }
                };
            } catch (error) {
                console.error('Cache cleanup error:', error);
            }
        }
    }
    
    // Get storage size
    async getStorageSize() {
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage || 0,
                quota: estimate.quota || 0,
                percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100
            };
        }
        
        // Fallback for localStorage
        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith(this.prefix)) {
                size += localStorage[key].length + key.length;
            }
        }
        
        return {
            usage: size,
            quota: 5 * 1024 * 1024, // 5MB typical localStorage limit
            percentage: (size / (5 * 1024 * 1024)) * 100
        };
    }
    
    // Export data
    async exportData() {
        const data = {
            version: this.dbVersion,
            exportDate: new Date().toISOString(),
            trips: await this.getAll('trips'),
            activities: await this.getAll('activities'),
            expenses: await this.getAll('expenses'),
            documents: await this.getAll('documents'),
            checklists: await this.getAll('checklists'),
            preferences: await this.getAll('preferences')
        };
        
        return data;
    }
    
    // Import data
    async importData(data) {
        try {
            // Validate data structure
            if (!data.version || !data.trips) {
                throw new Error('Invalid import data format');
            }
            
            // Clear existing data
            await this.clearAll();
            
            // Import each store
            for (const trip of (data.trips || [])) {
                await this.save('trips', trip);
            }
            
            for (const activity of (data.activities || [])) {
                await this.save('activities', activity);
            }
            
            for (const expense of (data.expenses || [])) {
                await this.save('expenses', expense);
            }
            
            for (const doc of (data.documents || [])) {
                await this.save('documents', doc);
            }
            
            for (const checklist of (data.checklists || [])) {
                await this.save('checklists', checklist);
            }
            
            for (const pref of (data.preferences || [])) {
                await this.save('preferences', pref);
            }
            
            return true;
        } catch (error) {
            console.error('Import error:', error);
            throw error;
        }
    }
}

// Create singleton instance
const Storage = new StorageManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}