import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={{
            uri: "https://via.placeholder.com/100", // ضع رابط الصورة الشخصية
          }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Omar Mohamed</Text>
        <TouchableOpacity style={styles.messageButton}>
          <Text style={styles.messageButtonText}>Send message</Text>
        </TouchableOpacity>
      </View>

      {/* Posts Section */}
      <ScrollView contentContainerStyle={styles.postsContainer}>
        {Array(2)
          .fill(null)
          .map((_, index) => (
            <TouchableOpacity
              key={index}
              style={styles.postCard}
              onPress={() => router.push(`/screens/details`)} // إرسال إلى صفحة التفاصيل مع تمرير معرف المنشور
            >
              <Image
                source={{
                  uri:
                    index === 0
                      ? "https://via.placeholder.com/300x150"
                      : "https://via.placeholder.com/300x150/0000FF/808080", // استبدل الصور حسب الحاجة
                }}
                style={styles.postImage}
              />
              <View style={styles.postFooter}>
                <Image
                  source={{
                    uri: "https://via.placeholder.com/40", // صورة صغيرة لصاحب المنشور
                  }}
                  style={styles.footerImage}
                />
                <Text style={styles.footerText}>Omar Mohamed</Text>
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
  messageButton: {
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
  messageButtonText: {
    fontSize: 16,
    color: "#880E4F",
    fontWeight: "bold",
  },
  postsContainer: {
    padding: 20,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  postImage: {
    width: "100%",
    height: 150,
  },
  postFooter: {
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
});
