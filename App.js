import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Weather from './index'; // Page météo
import Preferences from './Preferences'; // Page pour les préférences
import * as Notifications from 'expo-notifications';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Demander la permission pour les notifications
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications was denied.');
      }
    };

    requestPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Weather">
        <Stack.Screen name="Weather" component={Weather} options={{ title: 'Weather' }} />
        <Stack.Screen name="Preferences" component={Preferences} options={{ title: 'Preferences' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
