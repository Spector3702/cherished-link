import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Audio } from 'expo-av';
import { handleUserLocationChange, sendUserLocationChange, LocationType } from './services/locationService';
import { startRecording, stopRecording, uploadRecording } from './services/audioService';

const WatchScreen: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [watchNumber, setWatchNumber] = useState<number | null>(null);
  const [matchingNumber, setMatchingNumber] = useState<number | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const userCoordinatesRef = useRef<LocationType>(null);
  const [userLocation, setUserLocation] = useState<LocationType>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    // Simulate generating a unique watch number
    const generateWatchNumber = () => {
      const uniqueWatchNumber = Math.floor(Math.random() * 10000);
      setWatchNumber(uniqueWatchNumber);
    };

    generateWatchNumber();

    (async () => {
      try {
        const fetchedMatchingNumber = await fetchMatchingNumberFromBackend();
        setMatchingNumber(fetchedMatchingNumber);
      } catch (error) {
        console.error('Error fetching location or data:', error);
        setErrorMsg('An error occurred while fetching location or data');
      }
    })();
  }, []);

  const fetchMatchingNumberFromBackend = async (): Promise<number> => {
    try {
      const response = await fetch('https://your-backend-server.com/api/getMatchingNumber');
      const data = await response.json();
      return data.matchingNumber || Math.floor(Math.random() * 10000);
    } catch (error) {
      console.error('Error fetching matching number:', error);
      return 0;
    }
  };

  const handleRecording = async () => {
    if (recording) {
      const uri = recording.getURI();
      await stopRecording(recording, setRecording);
      if (uri) {
        uploadRecording(uri, watchNumber?.toString() || 'unknown');
      }
    } else {
      await startRecording(setRecording, permissionResponse, requestPermission);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        onUserLocationChange={(event) =>
          handleUserLocationChange(
            event,
            setUserLocation,
            mapRef,
            userCoordinatesRef,
            (locationData) => sendUserLocationChange(locationData, watchNumber)
          )
        }
        showsUserLocation={true}
        followsUserLocation={true}
      >
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
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={handleRecording}
      />
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
