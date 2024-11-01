import { Alert } from 'react-native';

export const sendVitalSigns = async () => {
    const randomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;

    const VitalSigns = {
        心率: Math.round(randomInRange(60, 100)),                                                  // 隨機心率範圍 60 到 100
        血壓: `${Math.round(randomInRange(90, 120))}/${Math.round(randomInRange(60, 80))}`,    // 隨機血壓範圍 90/60 到 120/80
        體溫: parseFloat(randomInRange(36.5, 37.3).toFixed(1))                               // 隨機體溫範圍 36.5°C 到 37.3°C，精確到小數點後一位
    };

    try {
        const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + '/vitalsigns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(VitalSigns),
        });
        if (!response.ok) {
            throw new Error('Error sending vital signs data to backend');
        }
    } catch (error) {
        console.error('Error sending vital signs data:', error);
        Alert.alert('Error', 'Failed to send the vital signs data to backend');
    }
};