import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PhoneNotificationPage from '../../app/(tabs)/index';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import {
    registerForPushNotificationsAsync,
    sendTokenToBackend,
} from '../../app/(tabs)/services/notificationService';

// Mock the external dependencies
jest.mock('expo-notifications', () => ({
    addNotificationReceivedListener: jest.fn(),
    addNotificationResponseReceivedListener: jest.fn(),
    removeNotificationSubscription: jest.fn(),
}));

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
}));

jest.mock('../services/notificationService', () => ({
    registerForPushNotificationsAsync: jest.fn(),
    sendTokenToBackend: jest.fn(),
}));

describe('Notification Component', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    it('should register for push notifications and send the token to the backend', async () => {
        const mockToken = 'expoPushToken123';
        registerForPushNotificationsAsync.mockResolvedValue(mockToken);

        const { getByText } = render(<PhoneNotificationPage />);

        // Wait for useEffect to finish registering
        await waitFor(() => expect(registerForPushNotificationsAsync).toHaveBeenCalled());

        // Ensure token was sent to backend
        expect(sendTokenToBackend).toHaveBeenCalledWith(mockToken);

        // Ensure the token is stored in the state and rendered in the component
        fireEvent.press(getByText('Register and Send Token'));
        await waitFor(() => expect(sendTokenToBackend).toHaveBeenCalledWith(mockToken));
    });

    it('should retrieve the user location and handle location errors', async () => {
        const mockLocation = { coords: { latitude: 10.0, longitude: 20.0 } };
        Location.getCurrentPositionAsync.mockResolvedValue(mockLocation);

        const { getByText } = render(<PhoneNotificationPage />);

        await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());

        // Ensure location is successfully retrieved and set in state
        expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
            accuracy: Location.Accuracy.High,
        });
    });

    it('should handle location permission errors gracefully', async () => {
        const mockError = 'Location permission denied';
        Location.getCurrentPositionAsync.mockRejectedValue(new Error(mockError));

        const { getByText } = render(<PhoneNotificationPage />);

        await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());

        // Ensure the error message is handled
        expect(getByText('Loading...')).toBeTruthy(); // Component continues to render with default behavior
    });

    it('should add notification listeners and update the state when a notification is received', async () => {
        const mockNotification = {
            request: {
                content: {
                    body: 'Test notification message',
                },
            },
        };

        Notifications.addNotificationReceivedListener.mockImplementation((callback) => {
            callback(mockNotification);
        });

        const { getByText } = render(<PhoneNotificationPage />);

        // Ensure the notification listener was added
        await waitFor(() =>
            expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled()
        );

        // Ensure notification updates the component
        expect(getByText('Test notification message')).toBeTruthy();
    });

    it('should clean up notification listeners on unmount', async () => {
        const { unmount } = render(<PhoneNotificationPage />);

        unmount();

        // Ensure listeners were removed when the component unmounted
        expect(Notifications.removeNotificationSubscription).toHaveBeenCalledTimes(2);
    });
});
