import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ExploreScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]); // لتخزين المنتجات
  const [loading, setLoading] = useState(true); // حالة التحميل
  const [refreshing, setRefreshing] = useState(false); // حالة التحديث بالسحب

  // استدعاء API
  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "https://skilled-tuna-skilled.ngrok-free.app/api/v1/products/"
      ); // رابط الـ API
      if (response.status === 404) {
        // Alert.alert("info", "not found products yet");
        return;
      } else if (response.ok) {
        const data = await response.json();

        // التحقق من أن البيانات عبارة عن مصفوفة
        if (!Array.isArray(data)) {
          throw new Error("API response is not an array");
        }

        const storedUser = await AsyncStorage.getItem("@user_data");
        let userData = null;

        if (storedUser) {
          userData = JSON.parse(storedUser);
          setUserData(userData);
        }

        // تصفية المنتجات بناءً على المستخدم الحالي
        const filteredProducts = data.filter(
          (product) => product.user.username !== userData?.username
        );

        const filteredProductsAvailable = filteredProducts.filter(
          (product) => product.available !== false
        );

        // ترتيب المنتجات حسب الوقت الأحدث
        const sortedProducts = filteredProductsAvailable.sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );

        // تحقق من عدم وجود منتجات غير منتجات المستخدم الحالي
        if (sortedProducts.length === 0) {
          Alert.alert("info", "There are no products other than yours.");
          setProducts([]);
        } else {
          // تحديث الحالة بالمنتجات
          setProducts(sortedProducts);
        }
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Failed to load products. Please try again later.");
    } finally {
      setLoading(false); // انتهاء التحميل
      setRefreshing(false); // انتهاء التحديث بالسحب
    }
  };

  // تحميل البيانات عند فتح الشاشة
  useEffect(() => {
    fetchProducts();
  }, []);

  // وظيفة التحديث عند السحب
  const onRefresh = () => {
    setRefreshing(true); // بدء التحديث بالسحب
    fetchProducts(); // استدعاء البيانات
  };

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
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>What do you want?</Text>
      </View>

      {/* Product List */}
      <ScrollView
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {products.map((product) => (
          <TouchableOpacity
            key={product.product_id}
            style={styles.productCard}
            onPress={() =>
              router.push(`/screens/details?id=${product.product_id}`)
            }
          >
            <Image
              source={{
                uri:
                  "https://skilled-tuna-skilled.ngrok-free.app/" + product.image ||
                  "https://via.placeholder.com/300x150",
              }}
              style={styles.productImage}
            />
            <Text style={styles.productTitle}>
              {product.title || "Title here"}
            </Text>
            <View style={styles.productFooter}>
              <Image
                source={{
                  uri:
                    "https://skilled-tuna-skilled.ngrok-free.app" + product.user.profile_img ||
                    "https://via.placeholder.com/40",
                }}
                style={styles.footerImage}
              />
              <Text style={styles.footerText}>
                {product.user.full_name || "Unknown User"}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#FFD1DC",
    marginTop: 5,
  },
  productList: {
    paddingHorizontal: 10,
    paddingTop: 20,
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
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
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
  footerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
