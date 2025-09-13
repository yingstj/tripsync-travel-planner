
/**
 * Saves a new activity to storage.
 * @param {object} activityData The activity data to save.
 * @returns {Promise<object>} The saved activity object with a new ID.
 */
async function saveActivityToStorage(activityData) {
    if (!activityData || !activityData.tripId) {
        throw new Error("Activity data and trip ID are required.");
    }

    const activityId = `activity_${Date.now()}`;
    const activity = {
        ...activityData,
        id: activityId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    try {
        await Storage.save('activities', activity);
        return activity;
    } catch (error) {
        console.error("Error saving activity to storage:", error);
        throw new Error("Failed to save activity.");
    }
}

/**
 * Fetches all activities for a given trip from storage.
 * @param {string} tripId The ID of the trip.
 * @returns {Promise<Array<object>>} A list of the trip's activities.
 */
async function fetchActivitiesFromStorage(tripId) {
    if (!tripId) {
        throw new Error("Trip ID is required to fetch activities.");
    }

    try {
        const activities = await Storage.query('activities', 'tripId', tripId);
        return activities.sort((a, b) => new Date(a.date) - new Date(b.date) || (a.time || '').localeCompare(b.time || ''));
    } catch (error) {
        console.error("Error fetching activities from storage:", error);
        throw new Error("Failed to fetch activities.");
    }
}
