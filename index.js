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
    Image, Dimensions,
    Button,  TouchableOpacity
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";

const openWeatherKey = '3bbacd904fc7fa7397a0d769b17418a0';
const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${openWeatherKey}`;

registerRootComponent(App);

const Weather = ({ navigation }) => {
    const [forecast, setForecast] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadForecast = async () => {
        setRefreshing(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            setRefreshing(false);
            return;
        }

        try {
            let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
            const response = await fetch(`${url}&lat=${location.coords.latitude}&lon=${location.coords.longitude}`);
            const data = await response.json();

            if (!response.ok) {
                Alert.alert('Error', 'Something went wrong');
            } else {
                setForecast(data);
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            Alert.alert('Error', 'Unable to fetch weather data');
        } finally {
            setRefreshing(false);
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
                        {/*<Image source={require('./assets/temp.png')} style={styles.extraInfoIcon} />*/}
                        <Text style={styles.extraInfoText}>Feels Like: {Math.round(feels_like)}°C</Text>
                    </View>
                    <View style={styles.extraInfoCard}>
                        {/*<Image source={require('./assets/humidity.png')} style={styles.extraInfoIcon} />*/}
                        <Text style={styles.extraInfoText}>Humidity: {Math.round(humidity)}%</Text>
                    </View>
                </View>

                {/* Additional Information Section */}
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
    extraInfoIcon: {
        width: 40,
        height: 40,
        marginBottom: 10,
    },
    extraInfoText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
        textAlign: 'center',
    },
    
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    margin: 20,
    marginLeft: 80,
    marginRight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
