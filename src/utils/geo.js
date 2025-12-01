// Haversine formula to calculate distance between two points
export function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineDistance = R * c; // Distance in km (straight line)

    // Apply a factor to estimate road distance (typically 1.2-1.4x straight line)
    // This gives a more realistic estimate closer to actual driving distance
    const roadDistanceEstimate = straightLineDistance * 1.3;

    return roadDistanceEstimate;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
