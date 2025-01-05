import { registerRootComponent } from 'expo';
import App from './App';
import {
  View,
  Text,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Image,
  Dimensions,
  Button,
  TouchableOpacity
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const openWeatherKey = '3bbacd904fc7fa7397a0d769b17418a0';
const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${openWeatherKey}`;

registerRootComponent(App);

// Fonction pour interpréter les données météo
const interpretWeather = (forecast) => {
  const { wind, main, weather } = forecast;
  const windSpeed = wind.speed;
  const temperature = main.temp;

  let interpretation = [];

  // Interprétation du vent
  if (windSpeed >= 90) {
    interpretation.push("Warning: A storm is approaching! Winds are at a dangerous 90 km/h.");
  } else if (windSpeed >= 60) {
    interpretation.push("Strong winds are present. Take caution.");
  } else if (windSpeed >= 30) {
    interpretation.push("Moderate winds are blowing.");
  } else {
    interpretation.push("The wind is calm.");
  }

  // Interprétation de la température
  if (temperature >= 35) {
    interpretation.push("It's extremely hot outside. Stay hydrated!");
  } else if (temperature >= 30) {
    interpretation.push("It's quite hot. Consider staying in a cool place.");
  } else if (temperature <= 0) {
    interpretation.push("Freezing temperatures! Stay warm.");
  } else if (temperature <= 10) {
    interpretation.push("It's chilly outside, a jacket might be needed.");
  }

  // Interprétation des conditions météo
  const description = weather[0].description;
  if (description.includes("rain")) {
    interpretation.push("Rain is expected. Don't forget your umbrella!");
  } else if (description.includes("clouds")) {
    interpretation.push("The sky is cloudy, but no rain for now.");
  } else if (description.includes("clear")) {
    interpretation.push("Clear skies. It's a beautiful day!");
  }

  return interpretation.join("\n");
};

// Vérification des seuils et envoi de notifications
const checkThresholdsAndNotify = async (forecast) => {
  try {
    const savedPreferences = await AsyncStorage.getItem("weatherPreferences");
    if (!savedPreferences) return;

    const preferences = JSON.parse(savedPreferences);

    const alerts = [];
    const currentHumidity = forecast.main.humidity;
    const currentTemperature = forecast.main.temp;
    const currentWindSpeed = forecast.wind.speed;

    // Vérification des seuils de température et d'humidité
    if (preferences.humidity && currentHumidity >= preferences.humidity) {
      alerts.push(`Humidity exceeded: ${currentHumidity}%`);
    }

    if (preferences.MaxTemperature && currentTemperature >= preferences.MaxTemperature) {
      alerts.push(`Maximum Temperature exceeded: ${currentTemperature}°C`);
    }
    if (preferences.MinTemperature && currentTemperature <= preferences.MinTemperature) {
        alerts.push(`Minimum Temperature exceeded: ${currentTemperature}°C`);
      }

    if (preferences.windSpeed && currentWindSpeed >= preferences.windSpeed) {
      alerts.push(`Wind Speed exceeded: ${currentWindSpeed} m/s`);
    }

    // Ajouter les alertes d'interprétation
    const weatherInterpretation = interpretWeather(forecast);
    alerts.push(weatherInterpretation);

    // Envoyer une notification s'il y a des alertes
    if (alerts.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Weather Alert!",
          body: alerts.join("\n"),
        },
        trigger: null, // Notification immédiate
      });

      // Alerte visuelle
      Alert.alert(
        "Weather Alert!",
        alerts.join("\n"),
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
  } catch (error) {
    console.error("Error checking thresholds or sending notification:", error);
  }
};

const Weather = ({ navigation }) => {
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications was denied.');
      } else {
        console.log('Notifications permissions granted.');
      }
    };

    requestPermissions();
  }, []);

  const [forecast, setForecast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadForecast = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
      const response = await fetch(`${url}&lat=${location.coords.latitude}&lon=${location.coords.longitude}`);
      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', 'Something went wrong');
        return;
      }

      setForecast(data);
      checkThresholdsAndNotify(data); // Vérifier les seuils et envoyer des notifications si nécessaire
    } catch (error) {
      console.error('Error fetching weather data:', error);
      Alert.alert('Error', 'Unable to fetch weather data');
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

  if (!forecast) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#00A9E0" />
      </SafeAreaView>
    );
  }

  const { weather, main, name, wind, sys, visibility, clouds } = forecast;
  const description = weather[0].description;
  const temperature = main.temp;
  const feels_like = main.feels_like;
  const humidity = main.humidity;
  const windSpeed = wind.speed;
  const pressure = main.pressure;
  const cloudCoverage = clouds.all;
  const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(sys.sunset * 1000).toLocaleTimeString();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Preferences')}>
        <Text style={styles.buttonText}>Preferences</Text>
      </TouchableOpacity>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadForecast} />}
        style={styles.scrollView}
      >
        <Text style={styles.title}>Weather Forecast</Text>
        <Text style={styles.subtitle}>Location: {name}</Text>

        <View style={styles.weatherCard}>
          <Image
            style={styles.weatherIcon}
            source={{ uri: `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png` }}
          />
          <Text style={styles.temperature}>{Math.round(temperature)}°C</Text>
          <Text style={styles.weatherDescription}>{description}</Text>
        </View>

        <View style={styles.extraInfoContainer}>
          <View style={styles.extraInfoCard}>
            <Text style={styles.extraInfoText}>Feels Like: {Math.round(feels_like)}°C</Text>
          </View>
          <View style={styles.extraInfoCard}>
            <Text style={styles.extraInfoText}>Humidity: {Math.round(humidity)}%</Text>
          </View>
        </View>

        <View style={styles.extraInfoContainer}>
          <View style={styles.extraInfoCard}>
            <Text style={styles.extraInfoText}>Wind Speed: {Math.round(windSpeed)} m/s</Text>
          </View>
          <View style={styles.extraInfoCard}>
            <Text style={styles.extraInfoText}>Pressure: {pressure} hPa</Text>
          </View>
        </View>

        <View style={styles.extraInfoContainer}>
          <View style={styles.extraInfoCard}>
            <Text style={styles.extraInfoText}>Visibility: {visibility / 1000} km</Text>
          </View>
          <View style={styles.extraInfoCard}>
            <Text style={styles.extraInfoText}>Cloud Coverage: {cloudCoverage}%</Text>
          </View>
        </View>

        <View style={styles.extraInfoContainer}>
          <View style={styles.extraInfoCard}>
            <Text style={styles.extraInfoText}>Sunrise: {sunrise}</Text>
          </View>
          <View style={styles.extraInfoCard}>
            <Text style={styles.extraInfoText}>Sunset: {sunset}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Weather;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F6FC',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F6FC',
  },
  scrollView: {
    marginTop: 30,
    paddingBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    color: '#555',
    marginBottom: 25,
  },
  weatherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  weatherIcon: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  temperature: {
    fontSize: 60,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  weatherDescription: {
    fontSize: 18,
    fontWeight: '300',
    color: '#888',
    textTransform: 'capitalize',
  },
  extraInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginHorizontal: 20,
  },
  extraInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (Dimensions.get('window').width - 60) / 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  extraInfoText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#555',
  },
  button: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 10,
    margin: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});
