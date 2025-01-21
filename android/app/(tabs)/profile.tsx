import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ProfileScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  const fetchProducts = async (token) => {
    try {
      const response = await fetch(
        `https://skilled-tuna-skilled.ngrok-free.app/api/v1/products/bytoken/${token}/`
      );
      if (response.ok) {
        const data = await response.json();
        const sortedProducts = data.sort(
          (a, b) => new Date(a.time) - new Date(b.time)
        );
        setProducts(sortedProducts);
      } else if (response.status === 404) {
        setProducts([]);
      } else {
        throw new Error(`Failed to load products: ${response.status}`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@user_data");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData(user);
          console.log("User data retrieved successfully!");

          if (user.token) {
            fetchProducts(user.token);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load user data.");
      }
    };

    fetchUserData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    if (userData && userData.token) {
      fetchProducts(userData.token);
    }
  };

  async function handleDeleteProduct(product_id: Number) {
    try {
      const response = await fetch(
        `https://skilled-tuna-skilled.ngrok-free.app/api/v1/products/delete/${product_id}/`,
        {
          method: "DELETE",
        }
      );
      const data = response.json();
      if (response.status === 404) {
        Alert.alert("Error", data.detail);
        return;
      } else if (response.ok) {
        return;
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Failed to delete product. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const createTwoButtonAlert = (product_id: Number) =>
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete your Product?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => handleDeleteProduct(product_id) },
      ]
    );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#880E4F" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/screens/settings")}
        >
          <Image
            source={{
              uri: "https://img.icons8.com/ios-glyphs/30/FFFFFF/settings.png",
            }}
            style={styles.settingsIcon}
          />
        </TouchableOpacity>

        {/* Display user profile image */}
        <Image
          source={{
            uri:
              userData && userData.profile_img
                ? `https://skilled-tuna-skilled.ngrok-free.app/${userData.profile_img}`
                : "https://via.placeholder.com/150",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>
          {userData && userData.full_name ? userData.full_name : "Unknown User"}
        </Text>
        <TouchableOpacity
          style={styles.createPostButton}
          onPress={() => router.push("/screens/create-product")}
        >
          <Text style={styles.createPostButtonText}>Create product</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => router.push(`/screens/details?id=${product.id}`)}
          >
            <Image
              source={{
                uri: `https://skilled-tuna-skilled.ngrok-free.app/${
                  product.image || "https://via.placeholder.com/300x150"
                }`,
              }}
              style={styles.productImage}
            />
            <View style={styles.productHeader}>
              <Text style={styles.productTitle}>
                {product.title || "Title here"}
              </Text>
              <TouchableOpacity
                style={styles.trashBtn}
                onPress={() => createTwoButtonAlert(product.id)}
              >
                <Ionicons name="trash" color="red" size={27} />
              </TouchableOpacity>
            </View>
            <View style={styles.productFooter}>
              {/* Display user profile image */}
              <Image
                source={{
                  uri:
                    userData && userData.profile_img
                      ? `https://skilled-tuna-skilled.ngrok-free.app${userData.profile_img}`
                      : "https://via.placeholder.com/50",
                }}
                style={styles.footerImage}
              />
              <Text style={styles.footerText}>
                {userData && userData.full_name
                  ? userData.full_name
                  : "Unknown User"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#880E4F",
    padding: 20,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: "relative",
  },
  settingsButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  settingsIcon: {
    width: 25,
    height: 25,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  createPostButton: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  createPostButtonText: {
    fontSize: 16,
    color: "#880E4F",
    fontWeight: "bold",
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  footerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  productList: {
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },

  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 180,
  },
  productTitle: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  trashBtn: {
    left: 350,
  },
});
