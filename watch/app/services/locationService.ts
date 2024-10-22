import MapView from 'react-native-maps';

export type LocationType = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
} | null;


export const sendUserLocationChange = async (
    locationData: LocationType,
    user: number | null
) => {
    if (!locationData || user === null) return;

    try {
        const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + '/gps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: user,
                location: {
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                },
            }),
        });

        const data = await response.json();
        console.log('Location sent successfully:', data);
    } catch (error) {
        console.error('Error sending location to backend:', error);
    }
};


export const handleUserLocationChange = (
    userLocationChangeEvent: any,
    setUserLocation: React.Dispatch<React.SetStateAction<LocationType>>,
    mapRef: React.RefObject<MapView>,
    userCoordinatesRef: React.MutableRefObject<LocationType | null>,
    sendUserLocationChangeFn: (locationData: LocationType) => void
) => {
    const coordinates = userLocationChangeEvent?.nativeEvent?.coordinate;

    if (coordinates) {
        const locationData = {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.05,
        };

        // 只在位置明顯變化時才更新
        if (
            !userCoordinatesRef.current ||
            Math.abs(userCoordinatesRef.current.latitude - locationData.latitude) > 0.00001 ||
            Math.abs(userCoordinatesRef.current.longitude - locationData.longitude) > 0.00001
        ) {
            console.log('User location updated:', locationData);
            setUserLocation(locationData);

            // 只有當還未有座標時才動畫定位
            if (!userCoordinatesRef.current) {
                mapRef.current?.animateToRegion(locationData, 1000);
            }

            userCoordinatesRef.current = locationData;

            // 傳送位置更新給後端
            sendUserLocationChangeFn(locationData);
        } else {
            console.log('Location change is too small, not updating.');
        }
    } else {
        console.warn('User location coordinates are undefined.');
    }
};
