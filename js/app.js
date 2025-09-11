// TripSync - Main Application
// Application State
const AppState = {
    currentView: 'dashboard',
    currentTrip: null,
    trips: [],
    activities: [],
    expenses: [],
    documents: [],
    checklists: {
        preTrip: [],
        packing: []
    },
    map: null,
    markers: [],
    currentMonth: new Date(),
    user: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
};

// Get storage instance from storage.js
const storage = Storage || new StorageManager();

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadDataFromStorage();
    setupEventListeners();
    renderCurrentView();
});

// Core Initialization
function initializeApp() {
    // Check for IndexedDB support
    if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported, falling back to localStorage');
    }
    
    // Initialize timezone detection
    detectUserTimezone();
    
    // Load saved preferences
    loadUserPreferences();
}

// Timezone Detection
function detectUserTimezone() {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        AppState.user.timezone = timezone;
    } catch (error) {
        console.error('Timezone detection failed:', error);
        AppState.user.timezone = 'UTC';
    }
}

// Load Data from Storage
async function loadDataFromStorage() {
    try {
        // Load trips
        AppState.trips = await storage.getAll('trips') || [];
        
        // Load activities
        AppState.activities = await storage.getAll('activities') || [];
        
        // Load expenses
        AppState.expenses = await storage.getAll('expenses') || [];
        
        // Load documents
        AppState.documents = await storage.getAll('documents') || [];
        
        // Load checklists
        const checklists = await storage.getAll('checklists') || [];
        if (checklists.length > 0) {
            AppState.checklists = checklists[0];
        }
        
        // Render dashboard with loaded data
        renderDashboard();
        
    } catch (error) {
        console.error('Failed to load data from storage:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
    }
}

// Fallback to localStorage
function loadFromLocalStorage() {
    try {
        const trips = localStorage.getItem('tripsync_trips');
        if (trips) {
            AppState.trips = JSON.parse(trips);
        }
        renderDashboard();
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
    }
}

// Load User Preferences
function loadUserPreferences() {
    const prefs = localStorage.getItem('tripsync_preferences');
    if (prefs) {
        Object.assign(AppState.user, JSON.parse(prefs));
    }
}

// Save User Preferences
function saveUserPreferences() {
    localStorage.setItem('tripsync_preferences', JSON.stringify(AppState.user));
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Modal triggers
    document.getElementById('newTrip')?.addEventListener('click', () => openModal('newTripModal'));
    document.getElementById('addActivity')?.addEventListener('click', () => openModal('activityModal'));
    document.getElementById('addExpense')?.addEventListener('click', () => openModal('expenseModal'));
    document.getElementById('uploadDocument')?.addEventListener('click', handleDocumentUpload);
    document.getElementById('addChecklistItem')?.addEventListener('click', handleAddChecklistItem);
    
    // Form submissions
    document.getElementById('newTripForm')?.addEventListener('submit', handleNewTrip);
    document.getElementById('activityForm')?.addEventListener('submit', handleNewActivity);
    
    // Modal close buttons
    document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.modal || e.target.closest('.modal').id;
            closeModal(modalId);
        });
    });
    
    // Calendar controls
    document.getElementById('calPrev')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('calNext')?.addEventListener('click', () => changeMonth(1));
    
    // Map controls
    document.getElementById('centerMap')?.addEventListener('click', centerMap);
    document.getElementById('fullscreenMap')?.addEventListener('click', toggleFullscreenMap);
    
    // Filter controls
    document.getElementById('tripFilter')?.addEventListener('change', filterTrips);
    
    // Share functionality
    document.getElementById('shareTrip')?.addEventListener('click', shareTrip);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Navigation Handler
function handleNavigation(e) {
    e.preventDefault();
    const view = e.target.dataset.view;
    
    // Update active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Update view
    AppState.currentView = view;
    renderCurrentView();
    
    // Close mobile menu if open
    closeMobileMenu();
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

function closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.remove('active');
}

// Render Current View
function renderCurrentView() {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show current view
    const currentSection = document.getElementById(AppState.currentView);
    if (currentSection) {
        currentSection.classList.add('active');
        
        // Render view-specific content
        switch (AppState.currentView) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'timeline':
                renderTimeline();
                break;
            case 'calendar':
                renderCalendar();
                break;
            case 'map':
                renderMap();
                break;
            case 'budget':
                renderBudget();
                break;
            case 'documents':
                renderDocuments();
                break;
            case 'checklist':
                renderChecklist();
                break;
        }
    }

    // Dashboard Rendering
function renderDashboard() {
    const grid = document.getElementById('tripsGrid');
    if (!grid) return;
    
    if (AppState.trips.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-suitcase-rolling fa-3x text-muted" style="color: #9ca3af; margin-bottom: 1rem;"></i>
                <h3>No trips yet</h3>
                <p class="text-muted">Start planning your next adventure!</p>
                <button class="btn-primary mt-md" onclick="openModal('newTripModal')">
                    <i class="fas fa-plus"></i> Create Your First Trip
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = AppState.trips.map(trip => `
        <div class="trip-card" onclick="selectTrip('${trip.id}')">
            <div class="trip-card-image"></div>
            <div class="trip-card-content">
                <h3 class="trip-card-title">${escapeHtml(trip.name)}</h3>
                <div class="trip-card-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(trip.destination)}</span>
                    <span><i class="fas fa-calendar"></i> ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</span>
                </div>
                <div class="trip-card-meta">
                    <span><i class="fas fa-dollar-sign"></i> Budget: ${formatCurrency(trip.budget)}</span>
                    <span class="trip-status ${trip.status}">${trip.status || 'draft'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Timeline Rendering
function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container || !AppState.currentTrip) {
        if (container) {
            container.innerHTML = '<p class="text-center text-muted">Please select a trip first</p>';
        }
        return;
    }
    
    const activities = AppState.activities
        .filter(a => a.tripId === AppState.currentTrip)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem;">
                <i class="fas fa-clock fa-2x text-muted" style="color: #9ca3af; margin-bottom: 1rem;"></i>
                <p class="text-muted">No activities planned yet</p>
                <button class="btn-primary mt-md" onclick="openModal('activityModal')">
                    <i class="fas fa-plus"></i> Add First Activity
                </button>
            </div>
        `;
        return;
    }
    
    // Group activities by date
    const groupedActivities = {};
    activities.forEach(activity => {
        const date = activity.date;
        if (!groupedActivities[date]) {
            groupedActivities[date] = [];
        }
        groupedActivities[date].push(activity);
    });
    
    container.innerHTML = Object.entries(groupedActivities).map(([date, dayActivities]) => `
        <div class="timeline-day">
            <div class="timeline-date">${formatDate(date, 'full')}</div>
            ${dayActivities.map(activity => `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <h3>${escapeHtml(activity.name)}</h3>
                        ${activity.time ? `<p><i class="fas fa-clock"></i> ${activity.time}</p>` : ''}
                        ${activity.location ? `<p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(activity.location)}</p>` : ''}
                        ${activity.cost ? `<p><i class="fas fa-dollar-sign"></i> ${formatCurrency(activity.cost)}</p>` : ''}
                        ${activity.notes ? `<p class="text-muted">${escapeHtml(activity.notes)}</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// Calendar Rendering
function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    const monthDisplay = document.getElementById('calendarMonth');
    
    if (!container) return;
    
    const year = AppState.currentMonth.getFullYear();
    const month = AppState.currentMonth.getMonth();
    
    // Update month display
    if (monthDisplay) {
        monthDisplay.textContent = `${AppState.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    }
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Create calendar grid
    let html = '<div class="calendar-grid">';
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        html += `<div class="calendar-header-day">${day}</div>`;
    });
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month">${daysInPrevMonth - i}</div>`;
    }
    
    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const activities = getActivitiesForDate(date);
        
        html += `<div class="calendar-day ${isToday ? 'today' : ''}">
            <div class="calendar-day-number">${day}</div>
            ${activities.map(a => `<div class="calendar-event">${escapeHtml(a.name)}</div>`).join('')}
        </div>`;
    }
    
    // Next month days
    const remainingDays = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Map Rendering
function renderMap() {
    const container = document.getElementById('mapContainer');
    if (!container) return;
    
    // Initialize map if not already done
    if (!AppState.map) {
        AppState.map = L.map('mapContainer').setView([40.7128, -74.0060], 10);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(AppState.map);
    }
    
    // Clear existing markers
    AppState.markers.forEach(marker => marker.remove());
    AppState.markers = [];
    
    // Add markers for current trip activities
    if (AppState.currentTrip) {
        const activities = AppState.activities.filter(a => a.tripId === AppState.currentTrip);
        activities.forEach(activity => {
            if (activity.coordinates) {
                const marker = L.marker(activity.coordinates)
                    .addTo(AppState.map)
                    .bindPopup(`<b>${escapeHtml(activity.name)}</b><br>${escapeHtml(activity.location || '')}`);
                AppState.markers.push(marker);
            }
        });
        
        // Fit map to markers
        if (AppState.markers.length > 0) {
            const group = new L.featureGroup(AppState.markers);
            AppState.map.fitBounds(group.getBounds().pad(0.1));
        }
    }
    
    // Refresh map size
    setTimeout(() => {
        AppState.map.invalidateSize();
    }, 100);
}

// Budget Rendering
function renderBudget() {
    if (!AppState.currentTrip) return;
    
    const trip = AppState.trips.find(t => t.id === AppState.currentTrip);
    const expenses = AppState.expenses.filter(e => e.tripId === AppState.currentTrip);
    
    if (!trip) return;
    
    const totalBudget = trip.budget || 0;
    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const remaining = totalBudget - totalSpent;
    
    // Update summary cards
    document.getElementById('totalBudget').textContent = formatCurrency(totalBudget);
    document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
    document.getElementById('remainingBudget').textContent = formatCurrency(remaining);
    
    // Group expenses by category
    const categories = {};
    expenses.forEach(expense => {
        const cat = expense.category || 'Other';
        if (!categories[cat]) {
            categories[cat] = { total: 0, items: [] };
        }
        categories[cat].total += expense.amount || 0;
        categories[cat].items.push(expense);
    });
    
    // Render categories
    const container = document.getElementById('expenseCategories');
    if (container) {
        container.innerHTML = Object.entries(categories).map(([category, data]) => {
            const percentage = totalBudget > 0 ? (data.total / totalBudget * 100) : 0;
            return `
                <div class="expense-category">
                    <div class="category-header">
                        <span class="category-name">${category}</span>
                        <span class="category-amount">${formatCurrency(data.total)}</span>
                    </div>
                    <div class="category-progress">
                        <div class="category-progress-bar" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Documents Rendering
function renderDocuments() {
    const container = document.getElementById('documentsGrid');
    if (!container) return;
    
    const documents = AppState.documents.filter(d => d.tripId === AppState.currentTrip);
    
    if (documents.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <i class="fas fa-file-alt fa-2x text-muted" style="color: #9ca3af; margin-bottom: 1rem;"></i>
                <p class="text-muted">No documents uploaded yet</p>
                <button class="btn-primary mt-md" onclick="handleDocumentUpload()">
                    <i class="fas fa-upload"></i> Upload First Document
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = documents.map(doc => `
        <div class="document-card" onclick="openDocument('${doc.id}')">
            <div class="document-icon">
                <i class="fas ${getDocumentIcon(doc.type)}"></i>
            </div>
            <div class="document-name">${escapeHtml(doc.name)}</div>
            <div class="document-size">${formatFileSize(doc.size)}</div>
        </div>
    `).join('');
}

// Checklist Rendering
function renderChecklist() {
    const preTripList = document.getElementById('preTripChecklist');
    const packingList = document.getElementById('packingChecklist');
    
    if (preTripList) {
        renderChecklistItems(preTripList, AppState.checklists.preTrip);
    }
    
    if (packingList) {
        renderChecklistItems(packingList, AppState.checklists.packing);
    }
}

function renderChecklistItems(container, items) {
    if (!items || items.length === 0) {
        container.innerHTML = '<li class="text-muted">No items yet</li>';
        return;
    }
    
    container.innerHTML = items.map((item, index) => `
        <li class="checklist-item ${item.completed ? 'completed' : ''}">
            <input type="checkbox" 
                   class="checklist-checkbox" 
                   ${item.completed ? 'checked' : ''}
                   onchange="toggleChecklistItem('${item.id}')">
            <span class="checklist-label">${escapeHtml(item.text)}</span>
        </li>
    `).join('');
}

// Form Handlers
async function handleNewTrip(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const trip = {
        id: generateId(),
        name: formData.get('tripName'),
        destination: formData.get('destination'),
        type: formData.get('tripType'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        budget: parseFloat(formData.get('budget')) || 0,
        notes: formData.get('notes'),
        status: 'draft',
        createdAt: new Date().toISOString()
    };
    
    // Validate dates
    if (new Date(trip.endDate) < new Date(trip.startDate)) {
        showToast('End date must be after start date', 'error');
        return;
    }
    
    // Save trip
    AppState.trips.push(trip);
    await storage.save('trips', trip);
    
    // Close modal and refresh
    closeModal('newTripModal');
    renderDashboard();
    showToast('Trip created successfully!', 'success');
    
    // Reset form
    e.target.reset();
}

async function handleNewActivity(e) {
    e.preventDefault();
    
    if (!AppState.currentTrip) {
        showToast('Please select a trip first', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const activity = {
        id: generateId(),
        tripId: AppState.currentTrip,
        name: formData.get('activityName'),
        date: formData.get('activityDate'),
        time: formData.get('activityTime'),
        location: formData.get('activityLocation'),
        category: formData.get('activityCategory'),
        cost: parseFloat(formData.get('activityCost')) || 0,
        notes: formData.get('activityNotes'),
        createdAt: new Date().toISOString()
    };
    
    // Save activity
    AppState.activities.push(activity);
    await storage.save('activities', activity);
    
    // Also add as expense if there's a cost
    if (activity.cost > 0) {
        const expense = {
            id: generateId(),
            tripId: AppState.currentTrip,
            activityId: activity.id,
            category: activity.category,
            amount: activity.cost,
            description: activity.name,
            date: activity.date
        };
        AppState.expenses.push(expense);
        await storage.save('expenses', expense);
    }
    
    // Close modal and refresh
    closeModal('activityModal');
    renderTimeline();
    showToast('Activity added successfully!', 'success');
    
    // Reset form
    e.target.reset();
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Helper Functions
function selectTrip(tripId) {
    AppState.currentTrip = tripId;
    AppState.currentView = 'timeline';
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('[data-view="timeline"]').classList.add('active');
    
    renderCurrentView();
}

function changeMonth(direction) {
    AppState.currentMonth.setMonth(AppState.currentMonth.getMonth() + direction);
    renderCalendar();
}

function getActivitiesForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return AppState.activities.filter(a => 
        a.tripId === AppState.currentTrip && 
        a.date === dateStr
    );
}

function centerMap() {
    if (AppState.map && AppState.markers.length > 0) {
        const group = new L.featureGroup(AppState.markers);
        AppState.map.fitBounds(group.getBounds().pad(0.1));
    }
}

function toggleFullscreenMap() {
    const container = document.getElementById('mapContainer');
    if (container) {
        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}

function filterTrips(e) {
    const filter = e.target.value;
    const now = new Date();
    
    let filteredTrips = AppState.trips;
    
    switch(filter) {
        case 'upcoming':
            filteredTrips = AppState.trips.filter(t => new Date(t.startDate) > now);
            break;
        case 'past':
            filteredTrips = AppState.trips.filter(t => new Date(t.endDate) < now);
            break;
        case 'draft':
            filteredTrips = AppState.trips.filter(t => t.status === 'draft');
            break;
    }
    
    // Re-render with filtered trips
    const grid = document.getElementById('tripsGrid');
    if (grid) {
        const temp = AppState.trips;
        AppState.trips = filteredTrips;
        renderDashboard();
        AppState.trips = temp; // Restore original
    }
}

async function shareTrip() {
    if (!AppState.currentTrip) {
        showToast('Please select a trip first', 'error');
        return;
    }
    
    const trip = AppState.trips.find(t => t.id === AppState.currentTrip);
    const shareData = {
        title: `Trip to ${trip.destination}`,
        text: `Check out my trip to ${trip.destination} from ${formatDate(trip.startDate)} to ${formatDate(trip.endDate)}`,
        url: window.location.href
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback - copy to clipboard
            await navigator.clipboard.writeText(shareData.url);
            showToast('Link copied to clipboard!', 'success');
        }
    } catch (error) {
        console.error('Error sharing:', error);
        showToast('Could not share trip', 'error');
    }
}

function handleDocumentUpload() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            return;
        }
        
        // Create document record
        const doc = {
            id: generateId(),
            tripId: AppState.currentTrip,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString()
        };
        
        // Store file in IndexedDB (or convert to base64 for localStorage)
        // For now, just store metadata
        AppState.documents.push(doc);
        await storage.save('documents', doc);
        
        renderDocuments();
        showToast('Document uploaded successfully!', 'success');
    };
    
    input.click();
}

function handleAddChecklistItem() {
    const t
}
