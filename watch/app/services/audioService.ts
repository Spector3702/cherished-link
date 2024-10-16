import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

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

export const uploadRecording = async (uri: string, user: string) => {
    try {
        const fileData = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const uploadResponse = await axios.post(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/voice-detection`,
            { fileData },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'user': user,
                },
            }
        );

        console.log('Audio uploaded:', uploadResponse.data.audio_file);
    } catch (error) {
        console.error('Error uploading recording:', error);
        Alert.alert('Error', 'Failed to upload the recording');
    }
};