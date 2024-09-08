import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

export async function startRecording(
    setRecording: (recording: Audio.Recording | null) => void,
    permissionResponse: Audio.PermissionResponse | null,
    requestPermission: () => Promise<Audio.PermissionResponse>
) {
    try {
        if (!permissionResponse || permissionResponse.status !== 'granted') {
            console.log('Requesting permission...');
            await requestPermission();
        }

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        console.log('Starting recording...');
        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        console.log('Recording started');
    } catch (err) {
        console.error('Failed to start recording', err);
    }
}

export async function stopRecording(
    recording: Audio.Recording,
    setRecording: (recording: Audio.Recording | null) => void
) {
    try {
        console.log('Stopping recording...');
        await recording.stopAndUnloadAsync();
        setRecording(null);

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });

        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);
    } catch (err) {
        console.error('Failed to stop recording', err);
    }
}

export const uploadRecording = async (
    uri: string,
    user: string
) => {
    try {
        // Fetch the file from the URI and create a Blob object
        const response = await fetch(uri);
        const blob = await response.blob();

        // Create a new FormData object
        const formData = new FormData();
        formData.append('file', blob, 'recording.m4a'); // Append the blob and specify the file name
        formData.append('user', user);

        // Make the POST request to the server
        const uploadResponse = await axios.post('http://192.168.1.116:5000/voice-detection', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Handle the response from the server
        Alert.alert('Success', `Audio uploaded: ${uploadResponse.data.audio_file}`);
    } catch (error) {
        console.error('Error uploading recording:', error);
        Alert.alert('Error', 'Failed to upload the recording');
    }
};