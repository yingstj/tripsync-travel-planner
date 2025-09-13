// --- CALENDAR VIEW ---
let currentCalendarDate = new Date();

function setupCalendar() {
    document.getElementById('calPrev').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('calNext').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
}

function renderCalendar() {
    const container = document.getElementById('calendar');
    const currentTrip = AppState.currentTrip;

    if (!container || !currentTrip) {
        document.getElementById('calendarContainer').innerHTML = '<p>No trip selected.</p>';
        return;
    }

    const month = currentCalendarDate.getMonth();
    const year = currentCalendarDate.getFullYear();

    document.getElementById('calendarMonth').textContent = `${currentCalendarDate.toLocaleString('default', { month: 'long' })} ${year}`;

    const calendarGrid = document.getElementById('calendarContainer');
    calendarGrid.innerHTML = ''; // Clear previous view

    // Add weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create blank days for the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        const blankDay = document.createElement('div');
        blankDay.className = 'calendar-day blank';
        calendarGrid.appendChild(blankDay);
    }

    // Create days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.innerHTML = `<span class="day-number">${i}</span>`;
        
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            dayCell.classList.add('today');
        }

        // Find activities for this day
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayActivities = AppState.activities.filter(a => a.date === dateStr);

        if (dayActivities.length > 0) {
            const activitiesList = document.createElement('ul');
            activitiesList.className = 'calendar-activities';
            dayActivities.forEach(activity => {
                const activityItem = document.createElement('li');
                activityItem.textContent = activity.name;
                activityItem.title = `${activity.time ? activity.time + ' ' : ''}${activity.name}`;
                activitiesList.appendChild(activityItem);
            });
            dayCell.appendChild(activitiesList);
        }

        calendarGrid.appendChild(dayCell);
    }
}
