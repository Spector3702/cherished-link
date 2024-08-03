// match_status.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';

export default function MatchStatus() {
    const params = useLocalSearchParams();
    const matchSuccess = params.matchSuccess === 'true';

    return (
        <View style={styles.container}>
            <Text style={styles.status}>{matchSuccess ? "Matching Successful!" : "Matching Failed"}</Text>
            <Link href={{ pathname: '/notifications' }} style={styles.link}>
                <Button title="View Notifications" onPress={() => { }} />
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    status: {
        fontSize: 18,
        marginBottom: 20,
    },
    link: {
        marginTop: 20,
    },
});
