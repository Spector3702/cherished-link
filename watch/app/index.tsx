import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Audio } from 'expo-av';
import { handleUserLocationChange, sendUserLocationChange, LocationType } from './services/locationService';
import { startRecording, stopRecording, uploadRecording } from './services/audioService';

const WatchScreen: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [watchNumber, setWatchNumber] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const mapRef = useRef<MapView | null>(null);
  const userCoordinatesRef = useRef<LocationType>(null);
  const [userLocation, setUserLocation] = useState<LocationType>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    const generateWatchNumber = () => {
      const uniqueWatchNumber = Math.floor(Math.random() * 10000);
      setWatchNumber(uniqueWatchNumber);
      sendWatchNumberToBackend(uniqueWatchNumber);
    };

    generateWatchNumber();
  }, []);

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

  const fetchMatchStatus = async () => {
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + '/get_match_status');
      const data = await response.json();
      if (data.match_status === 'success') {
        setIsVerified(true);
      } else {
        setErrorMsg('Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching match status:', error);
      setErrorMsg('Failed to verify match status.');
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

  // Render the initial view with watch number and verify button
  if (!isVerified) {
    return (
      <View style={styles.container}>
        {errorMsg && <Text style={styles.text}>{errorMsg}</Text>}
        {watchNumber !== null && (
          <Text style={styles.text}>Watch Number: {watchNumber}</Text>
        )}
        <Button title="Verify" onPress={fetchMatchStatus} />
      </View>
    );
  }

  // Render the map and recording button after verification is successful
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
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={handleRecording}
      />
      {errorMsg && <Text style={styles.text}>{errorMsg}</Text>}
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
