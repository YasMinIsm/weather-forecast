import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Weather from './index'; // Page météo
import Preferences from './Preferences'; // Nouvelle page pour les préférences

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Weather">
        <Stack.Screen name="Weather" component={Weather} options={{ title: 'Weather' }} />
        <Stack.Screen name="Preferences" component={Preferences} options={{ title: 'Preferences' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
