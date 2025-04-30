

class LocalStorageManager {
    private prefix
    constructor(prefix = 'app_') {
        this.prefix = prefix;
    }

    // Helper to add prefix to keys
    _getKey(key: string) {
        return `${this.prefix}${key}`;
    }

    // Set an item in storage
    setItem(key: string, value: any) {
        try {
            const data = JSON.stringify(value);
            localStorage.setItem(this._getKey(key), data);
        } catch (error) {
            console.error('Failed to set item:', error);
        }
    }

    // Get an item from storage
    getItem(key: string) {
        try {
            const data = localStorage.getItem(this._getKey(key));
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to parse item:', error);
            return null;
        }
    }

    // Remove an item from storage
    removeItem(key: string) {
        try {
            localStorage.removeItem(this._getKey(key));
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    }

    // Clear all items with the current prefix
    clear() {
        try {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Failed to clear storage:', error);
        }
    }

    // Check if a key exists
    hasItem(key: string) {
        return localStorage.getItem(this._getKey(key)) !== null;
    }

    // Get all keys with the current prefix
    getAllKeys() {
        return Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .map(key => key.replace(this.prefix, ''));
    }
}

// Example usage:
export const localStorageManager = new LocalStorageManager('FT_');

