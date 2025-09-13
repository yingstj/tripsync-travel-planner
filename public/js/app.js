
// Global App State
const AppState = {
    user: null,
    trips: [],
    currentTripId: null,
    currentView: 'dashboard',
    activities: [],
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

async function initApp() {
    showSpinner();
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userToken');

    if (!userId || userId === 'demo_token' && !localStorage.getItem('demoMode')) {
        window.location.href = 'index.html';
        return;
    }
    
    AppState.user = { id: userId, email: userEmail, name: userName };

    await loadTrips();
    renderCurrentView();
    hideSpinner();
}

// --- DATA LOADING ---
async function loadTrips() {
    try {
        const tripsData = await fetchTripsFromStorage(AppState.user.id);
        AppState.trips = tripsData;
    } catch (error) {
        console.error('Error loading trips:', error);
        showToast('Failed to load trips.', 'error');
    }
}

async function loadActivitiesForCurrentTrip() {
    if (!AppState.currentTripId) return;
    showSpinner();
    try {
        const activitiesData = await fetchActivitiesFromStorage(AppState.currentTripId);
        AppState.activities = activitiesData;
    } catch (error) {
        console.error('Error loading activities:', error);
        showToast('Failed to load activities.', 'error');
    } finally {
        hideSpinner();
    }
}

// --- NAVIGATION & VIEW RENDERING ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-view');
            
            if (!AppState.currentTripId && view !== 'dashboard') {
                showToast('Please select a trip first!', 'info');
                return;
            }
            
            AppState.currentView = view;
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            renderCurrentView();
        });
    });

    const navToggle = document.getElementById('navToggle');
    if(navToggle) {
        navToggle.addEventListener('click', () => {
            document.querySelector('.nav-menu').classList.toggle('active');
        });
    }
}

function renderCurrentView() {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const currentSection = document.getElementById(AppState.currentView);
    if (currentSection) {
        currentSection.classList.add('active');
        
        switch (AppState.currentView) {
            case 'dashboard': renderDashboard(); break;
            case 'timeline': renderTimeline(); break;
            case 'calendar': renderComingSoon('calendar'); break;
            case 'map': renderMap(); break;
            case 'budget': renderComingSoon('budget'); break;
            case 'documents': renderComingSoon('documents'); break;
            case 'checklist': renderComingSoon('checklist'); break;
        }
    }
}

// --- MODAL HANDLING ---
function setupModals() {
    document.querySelectorAll('.modal-close, .btn-secondary[data-modal]').forEach(btn => {
        const modalId = btn.getAttribute('data-modal');
        btn.addEventListener('click', () => closeModal(modalId));
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// --- GENERAL EVENT LISTENERS ---
function setupEventListeners() {
    document.getElementById('newTrip')?.addEventListener('click', () => openModal('newTripModal'));
    document.getElementById('newTripForm')?.addEventListener('submit', handleNewTripSubmit);
    document.getElementById('logoutButton')?.addEventListener('click', logout);
    document.getElementById('addActivity')?.addEventListener('click', () => openModal('activityModal'));
    document.getElementById('activityForm')?.addEventListener('submit', handleActivitySubmit);
}

// --- DASHBOARD ---
function renderDashboard() {
    const grid = document.getElementById('tripsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (AppState.trips.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-suitcase-rolling fa-3x" style="color: #9ca3af; margin-bottom: 1rem;"></i>
                <h3>No trips yet</h3>
                <p>Start planning your next adventure!</p>
                <button class="btn-primary" id="createFirstTripBtn">
                    <i class="fas fa-plus"></i> Create Your First Trip
                </button>
            </div>
        `;
        document.getElementById('createFirstTripBtn')?.addEventListener('click', () => openModal('newTripModal'));
        return;
    }
    
    AppState.trips.forEach(trip => {
        const card = document.createElement('div');
        card.className = 'trip-card';
        card.setAttribute('data-trip-id', trip.id);
        card.innerHTML = `
            <div class="trip-card-image" style="background-image: url('${trip.imageUrl || 'assets/default-trip.jpg'}')"></div>
            <div class="trip-card-content">
                <h3 class="trip-card-title">${escapeHtml(trip.name)}</h3>
                <div class="trip-card-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(trip.destination)}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => selectTrip(trip.id));
        grid.appendChild(card);
    });
}

async function handleNewTripSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const newTrip = {
        name: form.tripName.value.trim(),
        destination: form.destination.value.trim(),
        startDate: form.startDate.value,
        endDate: form.endDate.value,
        budget: form.budget.value || 0,
        notes: form.notes.value.trim(),
        status: 'draft',
    };

    if (!newTrip.name || !newTrip.destination || !newTrip.startDate || !newTrip.endDate) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }

    showSpinner();
    try {
        const savedTrip = await saveTripToStorage(AppState.user.id, newTrip);
        AppState.trips.push(savedTrip);
        selectTrip(savedTrip.id);
        closeModal('newTripModal');
        showToast('Trip created successfully!', 'success');
    } catch (error) {
        showToast('Failed to create trip.', 'error');
    } finally {
        hideSpinner();
    }
}

async function selectTrip(tripId) {
    AppState.currentTripId = tripId;
    await loadActivitiesForCurrentTrip();
    AppState.currentView = 'timeline';
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('.nav-link[data-view="timeline"]').classList.add('active');
    renderCurrentView();
}

// --- TIMELINE ---
function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    const currentTrip = AppState.currentTrip;
    if (!container || !currentTrip) {
        container.innerHTML = '<p>No trip selected or timeline data available.</p>';
        return;
    }

    let html = `<h2>Timeline for ${escapeHtml(currentTrip.name)}</h2>`;
    if (AppState.activities.length === 0) {
        html += '<p>No activities planned yet. Add one to get started!</p>';
    } else {
        const groupedActivities = AppState.activities.reduce((acc, activity) => {
            const date = activity.date.split('T')[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push(activity);
            return acc;
        }, {});

        Object.keys(groupedActivities).sort().forEach(date => {
            html += `<div class="timeline-day">
                        <div class="timeline-date">${formatDate(date)}</div>
                        <div class="timeline-items">`;
            groupedActivities[date].forEach(activity => {
                html += `<div class="timeline-item">
                            <div class="timeline-time">${activity.time || ''}</div>
                            <div class="timeline-content">
                                <h3>${escapeHtml(activity.name)}</h3>
                                <p>${escapeHtml(activity.location || '')}</p>
                            </div>
                         </div>`;
            });
            html += `</div></div>`;
        });
    }
    container.innerHTML = html;
}

async function handleActivitySubmit(event) {
    event.preventDefault();
    const form = event.target;
    const newActivity = {
        tripId: AppState.currentTripId,
        name: form.activityName.value.trim(),
        date: form.activityDate.value,
        time: form.activityTime.value,
        location: form.activityLocation.value.trim(),
        category: form.activityCategory.value,
        cost: form.activityCost.value || 0,
        notes: form.activityNotes.value.trim(),
    };

    if (!newActivity.name || !newActivity.date) {
        showToast('Please fill in activity name and date.', 'error');
        return;
    }

    showSpinner();
    try {
        const savedActivity = await saveActivityToStorage(newActivity);
        AppState.activities.push(savedActivity);
        renderTimeline();
        closeModal('activityModal');
        showToast('Activity added!', 'success');
    } catch (error) {
        showToast('Failed to add activity.', 'error');
    } finally {
        hideSpinner();
    }
}

// --- PLACEHOLDER RENDERERS ---
function renderComingSoon(viewName) {
    const container = document.getElementById(viewName);
    if (container) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 3rem; text-align: center;">
                <i class="fas fa-cogs fa-3x" style="color: #9ca3af; margin-bottom: 1rem;"></i>
                <h3>Coming Soon!</h3>
                <p>We're busy building this feature. Check back later!</p>
            </div>
        `;
    }
}


// --- UTILITY FUNCTIONS ---
function showSpinner() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function escapeHtml(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str || ''));
    return p.innerHTML;
}

function formatDate(dateString) {
    if(!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA');
}
