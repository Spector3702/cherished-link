import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WatchScreen: React.FC = () => {
  // Define state with a union type to include both number and null
  const [watchNumber, setWatchNumber] = useState<number | null>(null);
  const [matchingNumber, setMatchingNumber] = useState<number | null>(null);

  useEffect(() => {
    // Simulate retrieving a unique watch number
    const generateWatchNumber = () => {
      // This could be a static number or a generated ID
      const uniqueWatchNumber = Math.floor(Math.random() * 10000);
      setWatchNumber(uniqueWatchNumber);
    };

    generateWatchNumber();

    // Simulate fetching data from a server after a delay
    const fetchMatchingNumber = async () => {
      try {
        const response = await fetch('https://your-backend-server.com/api/getMatchingNumber');
        const data = await response.json();
        setMatchingNumber(data.matchingNumber);
      } catch (error) {
        console.error('Error fetching matching number:', error);
      }
    };

    // Fetch matching number after a delay to show the watch number first
    const fetchDelay = setTimeout(fetchMatchingNumber, 2000); // 2-second delay

    // Clean up timeout
    return () => clearTimeout(fetchDelay);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {watchNumber !== null ? `Watch Number: ${watchNumber}` : 'Generating Watch Number...'}
      </Text>
      {matchingNumber !== null && (
        <Text style={styles.text}>
          Matching Number: {matchingNumber}
        </Text>
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
    fontSize: 24,
    color: '#333',
  },
});

export default WatchScreen;
