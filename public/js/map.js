// --- MAP VIEW (Google Maps Platform) ---
let map;
let geocoder;
let placesService;

// This function is called by the Google Maps API script tag when it finishes loading
function initMapScript() {
    console.log("Google Maps API loaded and ready.");
    // Initialize Google Maps services
    geocoder = new google.maps.Geocoder();
    // placesService = new google.maps.places.PlacesService(map); // PlacesService needs a map instance
    // The map itself is initialized in renderMap when the view is active
}

async function renderMap() {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return;

    const currentTrip = AppState.currentTrip;
    if (!currentTrip) {
        mapContainer.innerHTML = '<p>No trip selected.</p>';
        return;
    }

    if (!map) {
        // Initialize map only once
        map = new google.maps.Map(mapContainer, {
            center: { lat: 0, lng: 0 }, // Default center, will be updated
            zoom: 2, // Default zoom, will be updated
            mapTypeId: 'roadmap'
        });
        placesService = new google.maps.places.PlacesService(map);
    }

    // Clear existing markers
    if (map.markers) {
        for (let i = 0; i < map.markers.length; i++) {
            map.markers[i].setMap(null);
        }
    }
    map.markers = [];

    const bounds = new google.maps.LatLngBounds();

    // Geocode destination and add marker
    if (currentTrip.destination) {
        try {
            const place = await geocodeAddress(currentTrip.destination);
            if (place && place.geometry && place.geometry.location) {
                const marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: currentTrip.name
                });
                map.markers.push(marker);
                bounds.extend(place.geometry.location);

                const infoWindow = new google.maps.InfoWindow({
                    content: `<b>${escapeHtml(currentTrip.name)}</b><br>${escapeHtml(currentTrip.destination)}`
                });
                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });
            }
        } catch (error) {
            console.error('Error geocoding destination:', error);
            showToast('Could not find location for the main destination.', 'error');
        }
    }

    // Add markers for activities
    for (const activity of AppState.activities) {
        if (activity.location) {
            try {
                const place = await geocodeAddress(activity.location);
                if (place && place.geometry && place.geometry.location) {
                    const marker = new google.maps.Marker({
                        map: map,
                        position: place.geometry.location,
                        title: activity.name,
                        icon: { // Custom icon for activities
                            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                            scaledSize: new google.maps.Size(32, 32)
                        }
                    });
                    map.markers.push(marker);
                    bounds.extend(place.geometry.location);

                    const infoWindow = new google.maps.InfoWindow({
                        content: `<b>${escapeHtml(activity.name)}</b><br>${escapeHtml(activity.location)}<br>${activity.time || ''}`
                    });
                    marker.addListener('click', () => {
                        infoWindow.open(map, marker);
                    });
                }
            } catch (error) {
                console.error(`Error geocoding activity location: ${activity.location}`, error);
            }
        }
    }

    // Fit map to markers or set a default view if no markers
    if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
    } else if (currentTrip.destination) {
        // If only destination was found, center on it with a better zoom
        const place = await geocodeAddress(currentTrip.destination);
        if (place && place.geometry && place.geometry.location) {
             map.setCenter(place.geometry.location);
             map.setZoom(10);
        }
    } else {
        map.setCenter({ lat: 20, lng: 0 }); // Fallback to a global view
        map.setZoom(2);
    }

    // Add event listeners for map controls (e.g., centerMap, fullscreenMap)
    document.getElementById('centerMap')?.addEventListener('click', () => {
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds);
        }
    });

    document.getElementById('fullscreenMap')?.addEventListener('click', () => {
        // Google Maps API handles fullscreen internally with its own controls, typically
        // However, if you want a custom button, you'd need to implement browser fullscreen API
        // For now, let's assume the default map UI might offer it or it's a future enhancement.
        showToast('Fullscreen control coming soon!', 'info');
    });
}

// Geocoding using Google Places API (or Geocoder fallback)
async function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
        if (!geocoder) {
            console.error("Geocoder not initialized.");
            return reject(new Error("Geocoder not available."));
        }
        geocoder.geocode({ 'address': address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                resolve(results[0]);
            } else {
                console.warn('Geocode was not successful for the following reason:' + status);
                resolve(null);
            }
        });
    });
}

// Function to enable autocomplete for destination input
function setupPlaceAutocomplete(inputId, callback) {
    const inputElement = document.getElementById(inputId);
    if (!inputElement || !google.maps || !google.maps.places) {
        console.warn("Google Maps Places library not loaded or input element not found for autocomplete.");
        return;
    }
    const autocomplete = new google.maps.places.Autocomplete(inputElement);
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            console.log('Autocomplete selected place:', place);
            if (callback) callback(place);
        } else {
            console.warn("No geometry for selected place.", place);
        }
    });
}


