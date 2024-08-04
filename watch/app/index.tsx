import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          console.error('Location permission not granted');
          return;
        }

        // Get current location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // Simulate fetching matching number from backend or phone app
        // Here you would implement the actual request to your server or phone app
        const fetchedMatchingNumber = await fetchMatchingNumberFromBackend();
        setMatchingNumber(fetchedMatchingNumber);
      } catch (error) {
        // Handle errors and log details to the console
        // setErrorMsg('Location request failed due to unsatisfied device settings.');
        console.error('Error fetching location:', error);
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
