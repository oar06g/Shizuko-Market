import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function CreateProductScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [token, setToken] = useState(null);

  for (let i = 0; i < price.length; i++) {
    if (price[i] === ',') {
      Alert.alert("Error", "Not allowed use apostrophe [,]")
    }
    
  }

  // تحميل بيانات المستخدم من AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@user_data");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setToken(user.token); // تعيين `token` من بيانات المستخدم
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
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
      Alert.alert("Error", "An unexpected error occurred while picking the image.");
    }
  };





  // إرسال البيانات إلى API
  const handlePost = async () => {
    if (!title || !description || !price || !image || !token) {
      Alert.alert("Error", "Please fill all fields and select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("available", true); // يمكنك جعلها ثابتة أو تغييرها حسب الحاجة
    formData.append("image", {
      uri: image,
      type: "image/jpeg",
      name: "product.jpg",
    });

    try {
      const response = await fetch("https://skilled-tuna-skilled.ngrok-free.app/api/v1/create-product/", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert("Success", "Product created successfully!");
        router.push("/(tabs)/profile")
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.detail || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Product</Text>

      <Text style={styles.label}>Product Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Add name for product"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Add description for product"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        placeholder="Add price of product"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>
          {image ? "Change photo" : "Choose one photo for product"}
        </Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#880E4F",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#880E4F",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  imagePicker: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#880E4F",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  imagePickerText: {
    color: "#880E4F",
    fontWeight: "bold",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  postButton: {
    backgroundColor: "#880E4F",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
