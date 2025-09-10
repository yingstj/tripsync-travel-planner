// TripSync Configuration File
// Central configuration for the application

const Config = {
    // Application Settings
    app: {
        name: 'TripSync Travel Planner',
        version: '1.0.0',
        author: 'Julie Yingst',
        email: 'contact@julieyingst.com',
        website: 'https://travel.julieyingst.com'
    },
    
    // API Keys (DO NOT COMMIT REAL KEYS)
    // These should be environment variables in production
    api: {
        mapbox: process.env.MAPBOX_API_KEY || '',
        google: {
            maps: process.env.GOOGLE_MAPS_API_KEY || '',
            calendar: process.env.GOOGLE_CALENDAR_API_KEY || '',
            places: process.env.GOOGLE_PLACES_API_KEY || ''
        },
        openWeather: process.env.OPENWEATHER_API_KEY || '',
        unsplash: process.env.UNSPLASH_API_KEY || '',
        exchangeRates: process.env.EXCHANGE_RATES_API_KEY || ''
    },
    
    // Storage Configuration
    storage: {
        prefix: 'tripsync_',
        version: 1,
        stores: {
            trips: 'trips',
            activities: 'activities',
            expenses: 'expenses',
            documents: 'documents',
            checklists: 'checklists',
            preferences: 'preferences'
        },
        maxFileSize: 5 * 1024 * 1024, // 5MB
        supportedFileTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
    },
    
    // Map Configuration
    map: {
        defaultCenter: [40.7128, -74.0060], // New York
        defaultZoom: 10,
        minZoom: 2,
        maxZoom: 18,
        tileProvider: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors'
    },
    
    // Calendar Configuration
    calendar: {
        firstDayOfWeek: 0, // 0 = Sunday, 1 = Monday
        weekendDays: [0, 6], // Saturday and Sunday
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h', // or '24h'
        defaultView: 'month' // 'month', 'week', 'day'
    },
    
    // Budget Configuration
    budget: {
        defaultCurrency: 'USD',
        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'],
        categories: [
            { id: 'transport', name: 'Transportation', icon: 'fa-plane', color: '#3b82f6' },
            { id: 'accommodation', name: 'Accommodation', icon: 'fa-bed', color: '#10b981' },
            { id: 'food', name: 'Food & Dining', icon: 'fa-utensils', color: '#f59e0b' },
            { id: 'activities', name: 'Activities', icon: 'fa-hiking', color: '#8b5cf6' },
            { id: 'shopping', name: 'Shopping', icon: 'fa-shopping-bag', color: '#ec4899' },
            { id: 'other', name: 'Other', icon: 'fa-ellipsis-h', color: '#6b7280' }
        ]
    },
    
    // Activity Types
    activities: {
        types: [
            { id: 'flight', name: 'Flight', icon: 'fa-plane' },
            { id: 'hotel', name: 'Hotel', icon: 'fa-bed' },
            { id: 'car', name: 'Car Rental', icon: 'fa-car' },
            { id: 'train', name: 'Train', icon: 'fa-train' },
            { id: 'restaurant', name: 'Restaurant', icon: 'fa-utensils' },
            { id: 'attraction', name: 'Attraction', icon: 'fa-landmark' },
            { id: 'event', name: 'Event', icon: 'fa-calendar-check' },
            { id: 'meeting', name: 'Meeting', icon: 'fa-handshake' },
            { id: 'other', name: 'Other', icon: 'fa-ellipsis-h' }
        ]
    },
    
    // Checklist Templates
    checklists: {
        preTrip: [
            'Check passport expiration date',
            'Apply for visa (if required)',
            'Book flights',
            'Book accommodation',
            'Purchase travel insurance',
            'Notify bank of travel dates',
            'Get necessary vaccinations',
            'Make copies of important documents',
            'Check weather forecast',
            'Download offline maps'
        ],
        packing: [
            'Passport and travel documents',
            'Wallet and credit cards',
            'Phone and charger',
            'Clothes for climate',
            'Toiletries',
            'Medications',
            'Camera',
            'Travel adapter',
            'Sunglasses',
            'Comfortable walking shoes'
        ]
    },
    
    // UI Configuration
    ui: {
        theme: 'light', // 'light', 'dark', 'auto'
        animations: true,
        toastDuration: 3000,
        modalBackdropBlur: true,
        itemsPerPage: 20,
        datePickerOptions: {
            enableTime: false,
            dateFormat: 'Y-m-d',
            minDate: 'today',
            maxDate: new Date().fp_incr(730) // 2 years
        }
    },
    
    // Feature Flags
    features: {
        collaboration: false,
        offlineMode: true,
        pwa: false,
        notifications: false,
        aiSuggestions: false,
        weatherIntegration: false,
        flightTracking: false,
        currencyConverter: false,
        socialSharing: true,
        exportPdf: false,
        importCalendar: false,
        mapClustering: true
    },
    
    // Validation Rules
    validation: {
        trip: {
            nameMinLength: 3,
            nameMaxLength: 100,
            destinationMaxLength: 200,
            notesMaxLength: 5000,
            minBudget: 0,
            maxBudget: 1000000
        },
        activity: {
            nameMinLength: 2,
            nameMaxLength: 200,
            locationMaxLength: 500,
            notesMaxLength: 2000,
            minCost: 0,
            maxCost: 100000
        }
    },
    
    // Error Messages
    errors: {
        storage: {
            quotaExceeded: 'Storage quota exceeded. Please clear some data.',
            unavailable: 'Storage is not available in your browser.',
            saveFailed: 'Failed to save data. Please try again.'
        },
        validation: {
            required: 'This field is required.',
            invalidDate: 'Please enter a valid date.',
            invalidEmail: 'Please enter a valid email address.',
            invalidUrl: 'Please enter a valid URL.',
            minLength: 'Minimum length is {min} characters.',
            maxLength: 'Maximum length is {max} characters.',
            minValue: 'Minimum value is {min}.',
            maxValue: 'Maximum value is {max}.'
        },
        network: {
            offline: 'You are currently offline.',
            timeout: 'Request timed out. Please try again.',
            serverError: 'Server error. Please try again later.',
            notFound: 'The requested resource was not found.'
        }
    },
    
    // Success Messages
    messages: {
        trip: {
            created: 'Trip created successfully!',
            updated: 'Trip updated successfully!',
            deleted: 'Trip deleted successfully!'
        },
        activity: {
            added: 'Activity added successfully!',
            updated: 'Activity updated successfully!',
            deleted: 'Activity deleted successfully!'
        },
        document: {
            uploaded: 'Document uploaded successfully!',
            deleted: 'Document deleted successfully!'
        },
        general: {
            saved: 'Changes saved successfully!',
            copied: 'Copied to clipboard!',
            shared: 'Shared successfully!'
        }
    }
};

// Freeze configuration to prevent modifications
Object.freeze(Config);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
