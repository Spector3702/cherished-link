import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Modal, Image, TouchableOpacity } from 'react-native';
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

  // Custom Modal
  interface CustomAlertProps {
    visible: boolean;
    onClose: () => void;
    message: string;
  }

  const CustomAlert: React.FC<CustomAlertProps> = ({ visible, onClose, message }) => (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.alertContainer}>
          <Image source={require('../assets/check_icon.png')} style={styles.iconStyle} />
          <Text style={styles.successText}>家人已經收到囉!!</Text>
          <Text style={styles.messageText}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  iconStyle: {
    width: 50,
    height: 50,
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default WatchScreen;
