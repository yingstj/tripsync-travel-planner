
// Trip data management functions

/**
 * Saves a new trip to storage.
 * @param {string} userId The ID of the user creating the trip.
 * @param {object} tripData The trip data to save.
 * @returns {Promise<object>} The saved trip object with a new ID.
 */
async function saveTripToStorage(userId, tripData) {
    if (!userId || !tripData) {
        throw new Error("User ID and trip data are required.");
    }

    const tripId = `trip_${Date.now()}`;
    const trip = {
        ...tripData,
        id: tripId,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    try {
        await Storage.save('trips', trip);
        return trip;
    } catch (error) {
        console.error("Error saving trip to storage:", error);
        throw new Error("Failed to save trip.");
    }
}

/**
 * Fetches all trips for a given user from storage.
 * @param {string} userId The ID of the user.
 * @returns {Promise<Array<object>>} A list of the user's trips.
 */
async function fetchTripsFromStorage(userId) {
    if (!userId) {
        throw new Error("User ID is required to fetch trips.");
    }

    try {
        // Assuming Storage.query can filter by userId.
        // If not, we would use getAll and filter manually.
        const trips = await Storage.query('trips', 'userId', userId);
        return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error("Error fetching trips from storage:", error);
        throw new Error("Failed to fetch trips.");
    }
}
