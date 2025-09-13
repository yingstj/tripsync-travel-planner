const Config = {
    // Application Settings
    app: {
        name: 'TripSync Travel Planner',
        version: '1.0.0',
        author: 'Julie Yingst',
        email: 'contact@julieyingst.com',
        website: 'https://travel.julieyingst.com'
    },
    
    // API Keys (Empty for now - add your own if needed)
    api: {
        mapbox: '',
        google: {
            maps: 'AIzaSyDHfXBVIXa50808Lg2ZoEA6tl4nwYCs8KY',
            calendar: '',
            places: 'AIzaSyDHfXBVIXa50808Lg2ZoEA6tl4nwYCs8KY'
        },
        openWeather: '',
        unsplash: '',
        exchangeRates: ''
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
            'image/png'
        ]
    },

    // Feature Flags
    features: {
        // Example: weatherIntegration: true,
    }
};
