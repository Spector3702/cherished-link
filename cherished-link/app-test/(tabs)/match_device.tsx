// match_device.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';

export default function MatchDevice() {
    const [deviceCode, setDeviceCode] = useState('');

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
            <Link
                href={{ pathname: '/match_status', params: { matchSuccess: deviceCode === '1234' ? 'true' : 'false' } }}
                style={styles.link}>
                <Button title="Match Device" onPress={() => { }} />
            </Link>
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
    link: {
        marginTop: 20,
    },
});
