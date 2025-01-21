import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignInScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
      if (isLoggedIn === "true") {
        router.replace("/(tabs)/home");
      }
    };
    checkLoginStatus();
  }, [router]);

  async function handleLogin() {
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    const data_send = {
      phone_number: phoneNumber,
      password: password,
    };
    try {
      const response = await fetch(
        "https://skilled-tuna-skilled.ngrok-free.app/api/v1/checkuser/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data_send),
        }
      );

      const data = await response.json();
      if (response.status === 200) {
        await AsyncStorage.setItem("isLoggedIn", "true");
        await AsyncStorage.setItem("@user_data", JSON.stringify(data));
        router.push("/home");
      } else if (response.status === 401) {
        Alert.alert(
          "Error", "Incorrect phone number or password."
        );
      } else if (response.status === 404) {
        Alert.alert("Error", "User not found");
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Error", "An error occurred connecting to the server.");
    }
  }
  // write function for go to forgot-password
  async function handleForgotPassword() {
    router.push("/forgotpass");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hello</Text>
        <Text style={styles.subtitle}>Sign in!</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="01234567890"
          placeholderTextColor="#9E9E9E"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          secureTextEntry={true}
          placeholderTextColor="#9E9E9E"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>Forget password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInText}>SIGN IN</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don’t have account?</Text>
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <Text style={styles.signUpLink}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  form: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: "#B00020",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 20,
    fontSize: 16,
    color: "#000",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    fontSize: 14,
    color: "#9E9E9E",
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: "#880E4F",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  signUpLink: {
    fontSize: 14,
    color: "#880E4F",
    fontWeight: "bold",
  },
});
