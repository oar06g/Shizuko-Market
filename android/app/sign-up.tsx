import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async () => {
    if (!fullName || !phoneNumber || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    for (let i = 0; i < username.length; i++) {
      if (username[i] === " ") {
        setUsername(username.replace(" ", ""));
      }
      if (username[i] === "'") {
        setUsername(username.replace("'", ""));
      }
    }
    for (let i = 0; i < fullName.length; i++) {
      if (fullName[i] === "'" || fullName[i] === ";" || fullName[i] === ":") {
        Alert.alert("error", "Not allowed use [' ; :]");
        return;
      }
    }
    if (fullName.length < 3) {
      Alert.alert("Error", "Minimum of full name 3 letters");
      return;
    }
    if (username.length < 3) {
      Alert.alert("Error", "Minimum of username 3 letters");
      return;
    }

    for (let i = 0; i < phoneNumber.length; i++) {
      if (phoneNumber[i] === " ") {
        setPhoneNumber(phoneNumber.replace(" ", ""));
      }
      if (phoneNumber[i] === "'") {
        setPhoneNumber(phoneNumber.replace("'", ""));
      }
      if (!Number(phoneNumber)) {
        Alert.alert("Error", "please enter your phone number");
        return;
      }
    }
    for (let i = 0; i < password.length; i++) {
      if (password[i] === "'") {
        Alert.alert("error", "Not allowed use apostrophe [,]");
        return;
      }
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    console.log(
      `Full Name:${fullName}, Phone Number: ${phoneNumber}, Password: ${password}`
    );

    const data_send = {
      full_name: fullName,
      username: username,
      phone_number: phoneNumber,
      password: password,
    };

    try {
      const response = await fetch(
        "https://skilled-tuna-skilled.ngrok-free.app/api/v1/adduser/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data_send),
        }
      );

      const data = await response.json();
      console.log("Response:", data); // طباعة الاستجابة

      if (response.ok) {
        // If registration is successful, redirect to the login page
        Alert.alert("success", "Done create account, now please login.");
        router.push("/sign-in");
      } else if (response.status === 400) {
        Alert.alert("Error", data.detail);
      } else {
        // If registration failed, show an error message
        Alert.alert(
          "Error",
          data.message || "An error occurred during registration."
        );
      }
    } catch (error) {
      console.error("Registration Error:", error);
      Alert.alert("Error", "An error occurred during registration.");
    }
  };

  // http://127.0.0.1:8000/api/v1/adduser

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hello</Text>
        <Text style={styles.subtitle}>Sign up!</Text>
      </View>

      <View style={styles.form}>
        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          placeholderTextColor="#9E9E9E"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          placeholderTextColor="#9E9E9E"
          value={username}
          onChangeText={setUsername}
        />

        {/* Phone Number */}
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="01234567890"
          placeholderTextColor="#9E9E9E"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          secureTextEntry={true}
          placeholderTextColor="#9E9E9E"
          value={password}
          onChangeText={setPassword}
        />

        {/* Confirm Password */}
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="********"
          secureTextEntry={true}
          placeholderTextColor="#9E9E9E"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpText}>SIGN UP</Text>
        </TouchableOpacity>

        {/* Go to Sign In */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/sign-in")}>
            <Text style={styles.signInLink}> Sign in</Text>
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
  signUpButton: {
    backgroundColor: "#880E4F",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  signUpText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  signInLink: {
    fontSize: 14,
    color: "#880E4F",
    fontWeight: "bold",
  },
});
