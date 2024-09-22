import * as Location from 'expo-location';


// Function to send the location to the backend
async function sendLocationToBackend(location: Location.LocationObject) {
    try {
        const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + '/set_home_location', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                home_location: location.coords
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to send location to backend');
        }

        const jsonResponse = await response.json();

        console.log('Location sent to backend successfully:', jsonResponse);
    } catch (error) {
        console.error('Error sending location to backend:', error);
    }
}


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

        await sendLocationToBackend(currentLocation);
        return currentLocation;
    } catch (error) {
        console.error('Error fetching location:', error);
        throw new Error('An error occurred while fetching location');
    }
}
