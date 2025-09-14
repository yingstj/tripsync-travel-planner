// Global App State
const AppState = {
    user: null,
    trips: [],
    currentTripId: null,
    currentView: 'dashboard',
    activities: [], // This will now hold all activities, scheduled and unscheduled
    get currentTrip() {
        return this.trips.find(t => t.id === this.currentTripId);
    }
};

// --- CORE APP INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupNavigation();
    setupModals();
    setupEventListeners();
});

function initMapScript() {
    console.log("Google Maps API loaded.");
    initAutocompleteForDestinationInput(document.querySelector('#destinationInputsContainer .destination-input'));
    initAutocompleteForActivityLocation(document.getElementById('customActivityLocation'));
}

async function initApp() {
    // ... (existing initApp code)
}

// --- DATA LOADING ---
// ... (existing data loading functions)

// --- NAVIGATION & VIEW RENDERING ---
function setupNavigation() {
    // ... (existing setupNavigation code)
}

function renderCurrentView() {
    document.querySelectorAll('.view-section').forEach(section => section.classList.remove('active'));
    const currentSection = document.getElementById(AppState.currentView);
    if (currentSection) {
        currentSection.classList.add('active');
        switch (AppState.currentView) {
            case 'dashboard': renderDashboard(); break;
            case 'planner': renderPlanner(); break;
            case 'timeline': renderTimeline(); break;
            case 'calendar': /* renderCalendar(); */ break;
            case 'map': /* renderMap(); */ break;
        }
    }
}

// --- MODAL HANDLING ---
// ... (existing modal handling functions)

// --- GENERAL EVENT LISTENERS ---
function setupEventListeners() {
    // ... (existing event listeners)
    document.getElementById('customActivityForm')?.addEventListener('submit', handleAddCustomActivity);
    document.getElementById('pointsOfInterestContainer')?.addEventListener('change', handlePoiCheckboxChange);
}


// --- DESTINATION & ACTIVITY AUTOCOMPLETE ---
// ... (existing autocomplete functions)


// --- DASHBOARD ---
function renderDashboard() {
    // ... (existing renderDashboard code)
}

async function handleNewTripSubmit(event) {
    // ... (existing handleNewTripSubmit code)
}

async function selectTrip(tripId) {
    AppState.currentTripId = tripId;
    await loadActivitiesForCurrentTrip();
    AppState.currentView = 'planner'; // Go to the new planner view
    renderCurrentView();
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[data-view="planner"]').classList.add('active');
}

// --- PLANNER VIEW ---
function renderPlanner() {
    if (!AppState.currentTrip) {
        // Redirect to dashboard if no trip is selected
        AppState.currentView = 'dashboard';
        renderCurrentView();
        return;
    }
    document.getElementById('plannerTripName').textContent = `Planner for ${AppState.currentTrip.name}`;
    fetchAndDisplaySuggestions();
    renderPlannerTimeline();
}

async function fetchAndDisplaySuggestions() {
    const container = document.getElementById('pointsOfInterestContainer');
    container.innerHTML = '<p>Loading suggestions...</p>';
    const placesService = new google.maps.places.PlacesService(document.createElement('div'));
    let suggestions = [];

    for (const destination of AppState.currentTrip.destinations) {
        const request = {
            location: new google.maps.LatLng(destination.lat, destination.lng),
            radius: '5000',
            type: ['tourist_attraction', 'museum', 'park']
        };
        const results = await new Promise(resolve => {
            placesService.nearbySearch(request, (res, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) resolve(res);
                else resolve([]);
            });
        });
        suggestions = suggestions.concat(results);
    }
    
    if (suggestions.length > 0) {
        container.innerHTML = suggestions.slice(0, 15).map(place => `
            <div class="poi-item">
                <input type="checkbox" id="${place.place_id}" data-name="${place.name}" data-location="${place.vicinity}" data-lat="${place.geometry.location.lat()}" data-lng="${place.geometry.location.lng()}">
                <label for="${place.place_id}">${place.name}</label>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<p>No suggestions found.</p>';
    }
}

async function handlePoiCheckboxChange(event) {
    const checkbox = event.target;
    const activityData = {
        id: `activity_${checkbox.id}`,
        tripId: AppState.currentTripId,
        name: checkbox.dataset.name,
        location: checkbox.dataset.location,
        lat: parseFloat(checkbox.dataset.lat),
        lng: parseFloat(checkbox.dataset.lng),
        date: null, // Unscheduled
        time: null,
    };

    if (checkbox.checked) {
        const savedActivity = await saveActivityToStorage(activityData);
        AppState.activities.push(savedActivity);
    } else {
        await deleteActivityFromStorage(activityData.id);
        AppState.activities = AppState.activities.filter(a => a.id !== activityData.id);
    }
    renderPlannerTimeline();
}

async function handleAddCustomActivity(event) {
    event.preventDefault();
    const form = event.target;
    const nameInput = form.querySelector('#customActivityName');
    const locationInput = form.querySelector('#customActivityLocation');
    
    const activityData = {
        tripId: AppState.currentTripId,
        name: nameInput.value,
        location: locationInput.value,
        lat: parseFloat(locationInput.dataset.lat) || null,
        lng: parseFloat(locationInput.dataset.lng) || null,
        date: null,
        time: null
    };

    const savedActivity = await saveActivityToStorage(activityData);
    AppState.activities.push(savedActivity);
    renderPlannerTimeline();
    form.reset();
}

function renderPlannerTimeline() {
    const unscheduledContainer = document.getElementById('unscheduledItems');
    const timelineContainer = document.getElementById('plannerTimelineContainer');
    
    // Render unscheduled activities
    const unscheduledActivities = AppState.activities.filter(a => !a.date);
    unscheduledContainer.innerHTML = unscheduledActivities.map(activity => renderActivityItem(activity)).join('');

    // Render scheduled activities
    const scheduledActivities = AppState.activities.filter(a => a.date);
    const groupedActivities = scheduledActivities.reduce((acc, activity) => {
        const date = activity.date.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(activity);
        return acc;
    }, {});
    
    const allDates = getDatesInRange(AppState.currentTrip.startDate, AppState.currentTrip.endDate);
    timelineContainer.innerHTML = allDates.map(date => {
        const dateString = date.toISOString().split('T')[0];
        const activitiesForDay = groupedActivities[dateString] || [];
        return `
            <div class="timeline-day" data-date="${dateString}">
                <div class="timeline-date">${formatDate(dateString)}</div>
                <button class="btn-secondary optimize-day-btn" data-date="${dateString}">Optimize</button>
                <div class="timeline-items drop-zone" ondragover="event.preventDefault()" ondrop="handleDrop(event)" data-date="${dateString}">
                    ${activitiesForDay.map(activity => renderActivityItem(activity)).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderActivityItem(activity) {
    return `
        <div class="timeline-item" draggable="true" data-activity-id="${activity.id}" ondragstart="handleDragStart(event)">
            <h3>${escapeHtml(activity.name)}</h3>
            <p>${escapeHtml(activity.location || '')}</p>
        </div>
    `;
}

// --- DRAG & DROP & OPTIMIZE ---
async function handleDrop(event) {
    event.preventDefault();
    const activityId = event.dataTransfer.getData('text/plain');
    const newDate = event.currentTarget.dataset.date === "null" ? null : event.currentTarget.dataset.date;
    
    const activity = AppState.activities.find(a => a.id === activityId);
    if (activity) {
        activity.date = newDate;
        await updateActivityInStorage(activity);
        renderPlannerTimeline();
    }
}

async function optimizeDayActivities(date) {
    let activitiesForDay = AppState.activities.filter(a => a.date === date && a.lat && a.lng);
    if (activitiesForDay.length < 2) return;

    let optimizedOrder = [activitiesForDay.shift()];
    while (activitiesForDay.length > 0) {
        let lastActivity = optimizedOrder[optimizedOrder.length - 1];
        let nearest = activitiesForDay.reduce((prev, curr) => {
            let prevDist = calculateDistance(lastActivity.lat, lastActivity.lng, prev.lat, prev.lng);
            let currDist = calculateDistance(lastActivity.lat, lastActivity.lng, curr.lat, curr.lng);
            return (currDist < prevDist) ? curr : prev;
        });
        optimizedOrder.push(nearest);
        activitiesForDay = activitiesForDay.filter(a => a.id !== nearest.id);
    }

    // Update AppState and re-render
    const otherActivities = AppState.activities.filter(a => a.date !== date);
    AppState.activities = [...otherActivities, ...optimizedOrder];
    renderPlannerTimeline();
    showToast('Day optimized!', 'success');
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    // ... (Haversine formula implementation)
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


// --- UTILITY FUNCTIONS ---
// ... (existing utility functions)
// Add a function to delete activities from storage
async function deleteActivityFromStorage(activityId) {
    // This assumes your Storage object has a 'delete' method
    if (Storage.delete) {
        await Storage.delete('activities', activityId);
    }
}
