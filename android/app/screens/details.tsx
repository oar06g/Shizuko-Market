import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useGlobalSearchParams } from "expo-router";

export default function ProductDetailsScreen() {
  const { id } = useGlobalSearchParams(); // الحصول على معرف المنتج من الرابط
  const [product, setProduct] = useState(null); // لتخزين بيانات المنتج
  const [loading, setLoading] = useState(true); // حالة التحميل

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`https://skilled-tuna-skilled.ngrok-free.app/api/v1/products/${id}/`); // جلب المنتج حسب المعرف
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await response.json();
        setProduct(data); // تخزين بيانات المنتج
      } catch (error) {
        console.error("Fetch Error:", error);
        Alert.alert("Error", "Failed to load product details. Please try again later.");
      } finally {
        setLoading(false); // انتهاء التحميل
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#880E4F" />
        <Text>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load product details.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* صورة المنتج */}
      <Image source={{ uri: "https://skilled-tuna-skilled.ngrok-free.app/" + product.image || "https://via.placeholder.com/300" }} style={styles.productImage} />

      {/* تفاصيل المنتج */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productTitle}>{product.title}</Text>
        <Text style={styles.productPrice}>EGP {product.price}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>

        {/* حالة المنتج */}
        <Text
          style={[
            styles.productStatus,
            { color: product.available ? "#4CAF50" : "#F44336" },
          ]}
        >
          {product.available ? "Available for Sale" : "Not Available"}
        </Text>

        {/* زر للتواصل */}
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Alert.alert("Contact Seller", "You can now contact the seller!")}
        >
          <Text style={styles.contactButtonText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#880E4F",
    marginBottom: 15,
  },
  productDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  productStatus: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: "#880E4F",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
