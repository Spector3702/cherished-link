import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Audio } from 'expo-av';
import CustomAlert from './customAlert';
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
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [uploadedMessage, setUploadedMessage] = useState<string>('');

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
      await stopRecording(recording, setRecording); // Ensure recording is stopped
      if (uri) {
        await uploadRecording(uri, watchNumber?.toString() || 'unknown'); // Ensure upload completes before setting modal
        setUploadedMessage('家人已經收到囉!!');
        setModalVisible(true); // Show modal after upload completes
      }
    } else {
      await startRecording(setRecording, permissionResponse, requestPermission);
    }
  };

  const closeModal = () => {
    setModalVisible(false); // Close the modal
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

      <Image source={require('../assets/record_icon.png')} style={styles.iconStyle} />

      <TouchableOpacity style={styles.button} onPress={handleRecording}>
        <Text style={styles.buttonText}>
          {recording ? '按一下結束錄音' : '按一下開始錄音'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.boldText}>跟家人分享一下在幹嘛吧！</Text>

      {errorMsg && <Text style={styles.text}>{errorMsg}</Text>}

      {/* Custom Modal */}
      <CustomAlert visible={isModalVisible} onClose={closeModal} message={uploadedMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  map: {
    // ...StyleSheet.absoluteFillObject,
    width: 0,
    height: 0,
  },
  button: {
    backgroundColor: 'transparent',
    padding: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'black',
    textDecorationLine: 'underline',
  },
  iconStyle: {
    width: 70,
    height: 70,
  },
  boldText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginHorizontal: 25,
  },
});

export default WatchScreen;
