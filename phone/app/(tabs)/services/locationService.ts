import * as Location from 'expo-location';

// Function to request location permissions and retrieve the current location
export async function getLocationAsync() {
    try {
        // Enable high accuracy mode using Google Play services
        await Location.enableNetworkProviderAsync();

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Permission to access location was denied');
        }

        // Retrieve the current location
        const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        console.log('Location retrieved successfully:', currentLocation);
        return currentLocation;
    } catch (error) {
        console.error('Error fetching location:', error);
        throw new Error('An error occurred while fetching location');
    }
}
