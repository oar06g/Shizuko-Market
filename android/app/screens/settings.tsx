import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function SettingsScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return true;
      }
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // تحديد نوع الوسائط
        allowsEditing: true, // السماح بالتعديل
        quality: 1, // جودة الصورة
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri; // استخدم أول صورة مختارة
        setImage(selectedImage);
      } else if (result.canceled) {
        Alert.alert("Error", "Image selection was canceled."); // المستخدم ألغى الاختيار
      } else {
        Alert.alert("Error", "Could not retrieve the image. Please try again."); // خطأ غير متوقع
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while picking the image."
      );
    }
  };

  async function handleUpdate() {
    try {
      const storedUser = await AsyncStorage.getItem("@user_data");
      if (storedUser) {
        const user = JSON.parse(storedUser);
  
        const formData = new FormData();
        formData.append("token", user.token);
        if (name) formData.append("full_name", name);
        if (username) formData.append("username", username);
        if (password && confirmPassword && password === confirmPassword) {
          formData.append("password", password);
        }
        if (image) {
          formData.append("image", {
            uri: image,
            type: "image/jpeg",
            name: "profile.jpg",
          });
        }
  
        const response = await fetch(
          "https://skilled-tuna-skilled.ngrok-free.app/api/v1/updateuser/",
          {
            method: "PUT",
            body: formData,
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Update Error:", errorData);
          Alert.alert("Error", errorData.message || "Failed to update data.");
          return;
        }
  
        await AsyncStorage.removeItem("isLoggedIn");
        await AsyncStorage.removeItem("@user_data");
        router.replace("/sign-in");
        Alert.alert("Success", "Data updated. Please log in again.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert("Error", "Unable to connect to the server. Check your network.");
    }
  }
  

  async function handleDelete() {
    try {
      const storedUser = await AsyncStorage.getItem("@user_data");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData(user);

        const response = await fetch(
          "https://skilled-tuna-skilled.ngrok-free.app/api/v1/deleteuser/",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: user.token }),
          }
        );

        const data = await response.json();
        if (data.status_code === 202) {
          await AsyncStorage.setItem("isLoggedIn", "false");
          await AsyncStorage.removeItem("@user_data");
          router.replace("/welcome");
        } else {
          return;
        }
      }
    } catch (error) {
      console.error("Error delete user:", error);
      Alert.alert("Error", "Failed to delete user.");
    }
  }

  const createTwoButtonAlert = () =>
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => handleDelete() },
      ]
    );
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Password Confirm</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
        <Text style={styles.imagePickerText}>
          {image ? "Done choose photo" : "Choose one photo for profile"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.updateButtonText}>Update</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={createTwoButtonAlert}
      >
        <Text style={styles.photoButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    backgroundColor: "maroon",
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
    marginTop: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 5,
    fontSize: 16,
  },
  photoButton: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: "red",
    padding: 10,
    width: 100,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "red",
    top: 190,
    left: 280,
  },
  updateButton: {
    marginTop: 30,
    backgroundColor: "maroon",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  imagePickerText: {
    color: "#880E4F",
    fontWeight: "bold",
  },
});
