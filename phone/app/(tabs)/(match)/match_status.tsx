// match_status.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';

export default function MatchStatus() {
    const params = useLocalSearchParams();
    const matchSuccess = params.matchSuccess === 'true';

    return (
        <View style={styles.container}>
            <Text style={styles.status}>{matchSuccess ? "配對成功!" : "配對失敗"}</Text>
            <Link href={{ pathname: '/' }} style={styles.link}>
                <Text style={styles.buttonText}>回到首頁</Text>
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
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        textAlign: 'center',
    },
});
