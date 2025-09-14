// Self-healing Storage Manager for TripSync

class StorageManager {
    constructor(dbName = 'TripSyncDB', version = 2) {
        this.dbName = dbName;
        this.dbVersion = version;
        this.db = null;
        this.initPromise = null;
        this.initDB();
    }

    async initDB() {
        this.initPromise = new Promise((resolve, reject) => {
            const openRequest = indexedDB.open(this.dbName, this.dbVersion);

            openRequest.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.setupSchema(db);
            };

            openRequest.onsuccess = (event) => {
                this.db = event.target.result;
                this.db.onerror = (dbEvent) => {
                    console.error(`Database error: ${dbEvent.target.errorCode}`);
                };
                resolve(this.db);
            };

            openRequest.onerror = async (event) => {
                console.error('IndexedDB error during open:', event.target.error);
                // If there's a version error or schema mismatch, the DB is corrupt.
                // This is our self-healing mechanism.
                if (event.target.error.name === 'VersionError' || event.target.error.name === 'InvalidStateError') {
                    console.warn('Database schema is outdated or corrupt. Deleting and recreating...');
                    if (this.db) {
                        this.db.close();
                    }
                    await this.deleteDB();
                    // Retry initialization
                    this.initDB().then(resolve).catch(reject);
                } else {
                    reject(event.target.error);
                }
            };
        });
        return this.initPromise;
    }
    
    async deleteDB() {
        return new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(this.dbName);
            deleteRequest.onsuccess = () => {
                console.log('Corrupt database deleted successfully.');
                resolve();
            };
            deleteRequest.onerror = (event) => {
                console.error('Error deleting database:', event.target.error);
                reject(event.target.error);
            };
            deleteRequest.onblocked = () => {
                 console.warn('Database delete blocked. Please close other tabs with this app open.');
                 reject(new Error('Database delete blocked.'));
            }
        });
    }

    setupSchema(db) {
        const storesToCreate = [
            { name: 'users', options: { keyPath: 'id' } },
            { name: 'trips', options: { keyPath: 'id' }, indices: [{ name: 'userId', keyPath: 'userId' }] },
            { name: 'activities', options: { keyPath: 'id' }, indices: [{ name: 'tripId', keyPath: 'tripId' }] }
        ];

        storesToCreate.forEach(storeInfo => {
            if (!db.objectStoreNames.contains(storeInfo.name)) {
                const objectStore = db.createObjectStore(storeInfo.name, storeInfo.options);
                if (storeInfo.indices) {
                    storeInfo.indices.forEach(index => {
                        objectStore.createIndex(index.name, index.keyPath);
                    });
                }
            }
        });
    }

    async getDB() {
        if (!this.initPromise) {
            await this.initDB();
        }
        return this.initPromise;
    }
    
    async execute(storeName, mode, operation) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction(storeName, mode);
                const store = transaction.objectStore(storeName);
                operation(store, resolve, reject);
                transaction.oncomplete = () => resolve();
                transaction.onerror = (event) => reject(event.target.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    async save(storeName, data) {
        return this.execute(storeName, 'readwrite', (store, resolve) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
        });
    }
    
    async get(storeName, id) {
        return this.execute(storeName, 'readonly', (store, resolve) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async getAll(storeName) {
        return this.execute(storeName, 'readonly', (store, resolve) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
        });
    }
    
    async query(storeName, indexName, value) {
        return this.execute(storeName, 'readonly', (store, resolve) => {
            const index = store.index(indexName);
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async update(storeName, id, data) {
        return this.execute(storeName, 'readwrite', (store, resolve) => {
            const request = store.put({ ...data, id });
            request.onsuccess = () => resolve(request.result);
        });
    }

    async delete(storeName, id) {
        return this.execute(storeName, 'readwrite', (store, resolve) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
        });
    }
}

const Storage = new StorageManager();
