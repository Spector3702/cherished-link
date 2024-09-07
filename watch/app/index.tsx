import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import * as Location from 'expo-location';

const WatchScreen: React.FC = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [watchNumber, setWatchNumber] = useState<number | null>(null);
  const [matchingNumber, setMatchingNumber] = useState<number | null>(null);

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
        // Check if the platform is Android and not Wear OS
        if (Platform.OS === 'android' && !Platform.isTV) {
          try {
            // Attempt to enable high accuracy mode using Google Play services
            await Location.enableNetworkProviderAsync();
          } catch (error) {
            console.warn('Google Play services might not be available:', error);
          }
        }

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          console.error('Location permission not granted');
          return;
        }

        // Retrieve the current location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);

        console.log('Location retrieved successfully:', currentLocation);

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
      {errorMsg ? (
        <Text style={styles.text}>{errorMsg}</Text>
      ) : (
        <>
          {watchNumber !== null && (
            <Text style={styles.text}>Watch Number: {watchNumber}</Text>
          )}
          {location ? (
            <Text style={styles.text}>
              Latitude: {location.coords.latitude.toFixed(2)}{'\n'}
              Longitude: {location.coords.longitude.toFixed(2)}
            </Text>
          ) : (
            <Text style={styles.text}>Fetching location...</Text>
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
});

export default WatchScreen;
