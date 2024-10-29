import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image } from 'react-native';

interface CustomAlertProps {
    visible: boolean;
    onClose: () => void;
    message: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, onClose, message }) => {
    // 使用 useEffect 來控制自動關閉
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClose(); // 自動關閉 Modal
            }, 3000); // 3秒後關閉 (可以根據需要調整)

            return () => clearTimeout(timer); // 清除計時器避免內存洩漏
        }
    }, [visible, onClose]);

    return (
        <Modal transparent={true} visible={visible} animationType="fade">
            <View style={styles.modalBackground}>
                <View style={styles.alertContainer}>
                    <Image source={require('../assets/check_icon.png')} style={styles.iconStyle} />
                    <Text style={styles.successText}>{message}</Text>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlert;

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    alertContainer: {
        width: 300,
        height: 200,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconStyle: {
        width: 70,
        height: 70,
        marginBottom: 20,
    },
    successText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
});
