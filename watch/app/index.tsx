import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Audio } from 'expo-av';
import { handleUserLocationChange, sendUserLocationChange, LocationType } from './services/locationService';
import { startRecording, stopRecording, uploadRecording } from './services/audioService';

const WatchScreen: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [watchNumber, setWatchNumber] = useState<number | null>(null);
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
      sendWatchNumberToBackend(uniqueWatchNumber);
    };

    generateWatchNumber();
  }, []);

  // Send the generated watch number to the backend
  const sendWatchNumberToBackend = async (generatedWatchNumber: number) => {
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + '/set_match_number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "match_number": generatedWatchNumber }),
      });
      if (!response.ok) {
        throw new Error('Error sending watch number to backend');
      }
    } catch (error) {
      console.error('Error sending watch number:', error);
      setErrorMsg('Failed to send watch number to backend');
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
        watchNumber !== null && (
          <Text style={styles.text}>Watch Number: {watchNumber}</Text>
        )
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
