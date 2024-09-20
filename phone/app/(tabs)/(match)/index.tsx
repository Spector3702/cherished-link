import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function MatchDevice() {
  const [deviceCode, setDeviceCode] = useState('');
  const [matchNumber, setMatchNumber] = useState(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // Function to fetch match number from backend
  const fetchMatchNumber = async () => {
    try {
      const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + '/get_match_number');
      const data = await response.json();
      setMatchNumber(data.match_number);
      return data.match_number;
    } catch (error) {
      console.error('Error fetching match number:', error);
      setErrorMsg('Failed to fetch match number from backend');
      return null;
    }
  };

  // Function to handle device matching logic
  const handleMatchDevice = async () => {
    const fetchedMatchNumber = await fetchMatchNumber();

    if (fetchedMatchNumber && deviceCode === fetchedMatchNumber.toString()) {
      router.push({
        pathname: '/match_status',
        params: { matchSuccess: 'true' }
      });
    } else {
      router.push({
        pathname: '/match_status',
        params: { matchSuccess: 'false' }
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your device code:</Text>
      <TextInput
        style={styles.input}
        onChangeText={setDeviceCode}
        value={deviceCode}
        placeholder="Device Code"
        keyboardType="numeric"
      />
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      <Button
        title="Match Device"
        onPress={handleMatchDevice}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
  },
  input: {
    height: 40,
    marginVertical: 10,
    width: '90%',
    borderWidth: 1,
    padding: 10,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
  },
});
