// Fix for js/app.js - Replace lines 183-223 with this corrected version:

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
}  // ← THIS CLOSING BRACE WAS MISSING!

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
