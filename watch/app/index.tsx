import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null;

const WatchScreen: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [watchNumber, setWatchNumber] = useState<number | null>(null);
  const [matchingNumber, setMatchingNumber] = useState<number | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const userCoordinatesRef = useRef<LocationType>(null);
  const [userLocation, setUserLocation] = useState<LocationType>(null);

  useEffect(() => {
    // Simulate generating a unique watch number
    const generateWatchNumber = () => {
      // Generate a random number to simulate a unique device number
      const uniqueWatchNumber = Math.floor(Math.random() * 10000);
      setWatchNumber(uniqueWatchNumber);
    };

    generateWatchNumber();

    (async () => {
      try {
        // Fetch the matching number from backend or other source
        const fetchedMatchingNumber = await fetchMatchingNumberFromBackend();
        setMatchingNumber(fetchedMatchingNumber);
      } catch (error) {
        console.error('Error fetching location or data:', error);
        setErrorMsg('An error occurred while fetching location or data');
      }
    })();
  }, []);

  // Simulated function to fetch the matching number from backend or phone app
  const fetchMatchingNumberFromBackend = async (): Promise<number> => {
    try {
      // Simulate fetching a number from a backend service
      // Replace this with actual fetch call to your backend or communication with phone app
      const response = await fetch('https://your-backend-server.com/api/getMatchingNumber');
      const data = await response.json();
      return data.matchingNumber || Math.floor(Math.random() * 10000); // Simulate a fallback matching number
    } catch (error) {
      console.error('Error fetching matching number:', error);
      return 0; // Fallback to a default value
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        onUserLocationChange={(userLocationChangeEvent) => {
          const coordinates = userLocationChangeEvent?.nativeEvent?.coordinate;

          if (coordinates) {
            const locationData = {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.04, // Adjust this value based on zoom level needs
              longitudeDelta: 0.05, // Adjust this value based on zoom level needs
            };

            console.log('User location updated:', locationData);

            // Store the coordinates when available for further use
            setUserLocation(locationData);

            // Animate to user's location when first detected
            if (!userCoordinatesRef.current) {
              mapRef.current?.animateToRegion(locationData, 1000);
            }

            // Save the coordinates to prevent multiple animations
            userCoordinatesRef.current = locationData;
          } else {
            console.warn('User location coordinates are undefined.');
          }
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      // Additional props can be added based on your requirements
      >
        {/* You can add your markers here */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="This is where you are currently located"
          />
        )}
      </MapView>
      {errorMsg ? (
        <Text style={styles.text}>{errorMsg}</Text>
      ) : (
        <>
          {watchNumber !== null && (
            <Text style={styles.text}>Watch Number: {watchNumber}</Text>
          )}

          {matchingNumber !== null && (
            <Text style={styles.text}>Matching Number: {matchingNumber}</Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default WatchScreen;
