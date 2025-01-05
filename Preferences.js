import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Preferences = ({ navigation }) => {
  const [preferences, setPreferences] = useState({
    humidity: "",
    windSpeed: "",
    visibility: "",
    pressure: "",
    cloudCoverage: "",
  });

  // Récupérer les préférences sauvegardées au démarrage de la page
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPreferences = await AsyncStorage.getItem("weatherPreferences");
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences)); // Charger les préférences enregistrées
        }
      } catch (error) {
        console.error("Error loading preferences", error);
      }
    };
    loadPreferences();
  }, []);

  const handleSave = async () => {
    // Vérifier si au moins un champ est rempli
    const isAnyFieldFilled = Object.values(preferences).some(value => value !== "");
    if (!isAnyFieldFilled) {
      Alert.alert("Error", "Please fill in at least one field.");
      return;
    }

    try {
      await AsyncStorage.setItem("weatherPreferences", JSON.stringify(preferences));
      Alert.alert("Success", "Your preferences have been saved!");
      navigation.goBack(); // Retour à la page précédente
    } catch (error) {
      console.error("Error saving preferences", error);
      Alert.alert("Error", "An error occurred while saving preferences.");
    }
  };

  const handleInputChange = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Set Weather Alert Thresholds</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Humidity (%)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="E.g.: 80"
          value={preferences.humidity}
          onChangeText={(value) => handleInputChange("humidity", value)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Wind Speed (m/s)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="E.g.: 10"
          value={preferences.windSpeed}
          onChangeText={(value) => handleInputChange("windSpeed", value)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Visibility (km)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="E.g.: 5"
          value={preferences.visibility}
          onChangeText={(value) => handleInputChange("visibility", value)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Pressure (hPa)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="E.g.: 1015"
          value={preferences.pressure}
          onChangeText={(value) => handleInputChange("pressure", value)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Cloud Coverage (%)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="E.g.: 50"
          value={preferences.cloudCoverage}
          onChangeText={(value) => handleInputChange("cloudCoverage", value)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F6FC",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  field: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Preferences;
