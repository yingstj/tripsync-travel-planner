// TripSync Utility Functions
// Reusable utility functions for the application

const Utils = {
    // Date and Time Utilities
    date: {
        format(date, format = 'short') {
            if (!date) return '';
            const d = new Date(date);
            
            const formats = {
                short: { month: 'short', day: 'numeric', year: 'numeric' },
                long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
                full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
                iso: () => d.toISOString(),
                time: { hour: '2-digit', minute: '2-digit' }
            };
            
            if (format === 'iso') return formats.iso();
            return d.toLocaleDateString('en-US', formats[format] || formats.short);
        },
        
        addDays(date, days) {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        },
        
        daysBetween(date1, date2) {
            const oneDay = 24 * 60 * 60 * 1000;
            const firstDate = new Date(date1);
            const secondDate = new Date(date2);
            return Math.round(Math.abs((firstDate - secondDate) / oneDay));
        },
        
        isToday(date) {
            const today = new Date();
            const d = new Date(date);
            return d.toDateString() === today.toDateString();
        },
        
        isPast(date) {
            return new Date(date) < new Date();
        },
        
        isFuture(date) {
            return new Date(date) > new Date();
        },
        
        getMonthName(monthIndex) {
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
            return months[monthIndex];
        },
        
        getDayName(dayIndex) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[dayIndex];
        }
    },
    
    // String Utilities
    string: {
        truncate(str, length = 50, suffix = '...') {
            if (!str) return '';
            if (str.length <= length) return str;
            return str.substring(0, length - suffix.length) + suffix;
        },
        
        capitalize(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },
        
        titleCase(str) {
            if (!str) return '';
            return str.replace(/\w\S*/g, txt => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        },
        
        slugify(str) {
            if (!str) return '';
            return str
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        },
        
        escapeHtml(str) {
            if (!str) return '';
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },
        
        unescapeHtml(str) {
            if (!str) return '';
            const doc = new DOMParser().parseFromString(str, 'text/html');
            return doc.documentElement.textContent;
        }
    },
    
    // Number Utilities
    number: {
        format(num, decimals = 0) {
            return Number(num).toFixed(decimals);
        },
        
        formatCurrency(amount, currency = 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount || 0);
        },
        
        formatPercentage(value, decimals = 0) {
            return `${(value * 100).toFixed(decimals)}%`;
        },
        
        random(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        
        round(num, decimals = 2) {
            return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
        }
    },
    
    // Array Utilities
    array: {
        chunk(array, size) {
            const chunks = [];
            for (let i = 0; i < array.length; i += size) {
                chunks.push(array.slice(i, i + size));
            }
            return chunks;
        },
        
        unique(array) {
            return [...new Set(array)];
        },
        
        groupBy(array, key) {
            return array.reduce((result, item) => {
                const group = item[key];
                if (!result[group]) result[group] = [];
                result[group].push(item);
                return result;
            }, {});
        },
        
        sortBy(array, key, order = 'asc') {
            return array.sort((a, b) => {
                if (order === 'asc') {
                    return a[key] > b[key] ? 1 : -1;
                } else {
                    return a[key] < b[key] ? 1 : -1;
                }
            });
        },
        
        shuffle(array) {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }
    },
    
    // Object Utilities
    object: {
        deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        
        merge(...objects) {
            return Object.assign({}, ...objects);
        },
        
        pick(obj, keys) {
            return keys.reduce((result, key) => {
                if (obj.hasOwnProperty(key)) {
                    result[key] = obj[key];
                }
                return result;
            }, {});
        },
        
        omit(obj, keys) {
            const result = { ...obj };
            keys.forEach(key => delete result[key]);
            return result;
        },
        
        isEmpty(obj) {
            return Object.keys(obj).length === 0;
        }
    },
    
    // DOM Utilities
    dom: {
        createElement(tag, attributes = {}, children = []) {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
                } else if (key.startsWith('on')) {
                    element.addEventListener(key.substring(2).toLowerCase(), value);
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else {
                    element.appendChild(child);
                }
            });
            
            return element;
        },
        
        query(selector, parent = document) {
            return parent.querySelector(selector);
        },
        
        queryAll(selector, parent = document) {
            return Array.from(parent.querySelectorAll(selector));
        },
        
        addClass(element, className) {
            element.classList.add(className);
        },
        
        removeClass(element, className) {
            element.classList.remove(className);
        },
        
        toggleClass(element, className) {
            element.classList.toggle(className);
        },
        
        hasClass(element, className) {
            return element.classList.contains(className);
        }
    },
    
    // Storage Utilities
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage error:', e);
                return false;
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage error:', e);
                return defaultValue;
            }
        },
        
        remove(key) {
            localStorage.removeItem(key);
        },
        
        clear() {
            localStorage.clear();
        },
        
        getSize() {
            let size = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    size += localStorage[key].length + key.length;
                }
            }
            return size;
        }
    },
    
    // Validation Utilities
    validation: {
        isEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        isUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
        
        isPhone(phone) {
            const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            return re.test(phone);
        },
        
        isDate(date) {
            return !isNaN(Date.parse(date));
        },
        
        isEmpty(value) {
            return value === null || value === undefined || value === '' || 
                   (Array.isArray(value) && value.length === 0) ||
                   (typeof value === 'object' && Object.keys(value).length === 0);
        },
        
        minLength(value, min) {
            return value && value.length >= min;
        },
        
        maxLength(value, max) {
            return !value || value.length <= max;
        },
        
        between(value, min, max) {
            return value >= min && value <= max;
        }
    },
    
    // File Utilities
    file: {
        formatSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        },
        
        getExtension(filename) {
            return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
        },
        
        getMimeType(filename) {
            const ext = this.getExtension(filename).toLowerCase();
            const mimeTypes = {
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };
            return mimeTypes[ext] || 'application/octet-stream';
        },
        
        toBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }
    },
    
    // URL Utilities
    url: {
        getParams(url = window.location.href) {
            const params = {};
            const urlObj = new URL(url);
            urlObj.searchParams.forEach((value, key) => {
                params[key] = value;
            });
            return params;
        },
        
        buildQuery(params) {
            return Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
        },
        
        updateParam(key, value, url = window.location.href) {
            const urlObj = new URL(url);
            urlObj.searchParams.set(key, value);
            return urlObj.toString();
        },
        
        removeParam(key, url = window.location.href) {
            const urlObj = new URL(url);
            urlObj.searchParams.delete(key);
            return urlObj.toString();
        }
    },
    
    // Debounce and Throttle
    performance: {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    },
    
    // ID Generation
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
