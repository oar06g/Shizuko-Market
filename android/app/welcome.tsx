import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WelcomeScreen() {
  const router = useRouter();
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    // تحقق إذا كان المستخدم قد دخل من قبل
    const checkFirstTime = async () => {
      const hasVisitedBefore = await AsyncStorage.getItem("hasVisitedBefore");
      if (hasVisitedBefore) {
        setIsFirstTime(false);
      } else {
        setIsFirstTime(true);
        await AsyncStorage.setItem("hasVisitedBefore", "true");
      }
    };
    checkFirstTime();
  }, []);

  useEffect(() => {
    if (isFirstTime === null) return; // لا نقوم بأي شيء إذا كانت القيمة لا تزال null
    if (isFirstTime === false) {
      router.replace("/sign-in");
    } else if (isFirstTime === true) {
      router.replace("/welcome");
    }
  }, [isFirstTime, router]);

  if (isFirstTime === null) {
    return null; // عرض فارغ أو شاشة تحميل حتى يتم تحديد الزيارة الأولى
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Shizuko Market</Text>

      {/* Sign In Button */}
      <TouchableOpacity
        style={styles.signInButton}
        onPress={() => router.push("/sign-in")}
      >
        <Text style={styles.signInText}>SIGN IN</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={() => router.push("/sign-up")}
      >
        <Text style={styles.signUpText}>SIGN UP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#8C1D39", // اللون الأساسي للخلفية
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF", // لون النص الأبيض
    fontSize: 32, // حجم الخط
    fontWeight: "bold",
    marginBottom: 50, // مسافة بين العنوان والأزرار
  },
  signInButton: {
    width: 200,
    height: 50,
    borderColor: "#FFFFFF", // لون الإطار
    borderWidth: 2,
    borderRadius: 25, // زوايا دائرية
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20, // مسافة بين الزرين
  },
  signInText: {
    color: "#FFFFFF", // لون النص داخل زر SIGN IN
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpButton: {
    width: 200,
    height: 50,
    backgroundColor: "#FFFFFF", // خلفية بيضاء
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    color: "#8C1D39", // لون النص داخل زر SIGN UP
    fontSize: 16,
    fontWeight: "bold",
  },
});
