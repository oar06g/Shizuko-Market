import React, { useState, useEffect } from "react";
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

export default function MessageScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // استدعاء API للرسائل
  const fetchMessages = async () => {
    try {
      const response = await fetch("https://skilled-tuna-skilled.ngrok-free.app/api/v1/messages/");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        Alert.alert("Info", "No messages found.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Failed to load messages. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#880E4F" />
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Stay connected with your friends</Text>
      </View>

      {/* Message List */}
      <ScrollView
        contentContainerStyle={styles.messageList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {messages.map((message) => (
          <TouchableOpacity
            key={message.id}
            style={styles.messageCard}
            onPress={() => Alert.alert("Message", message.text)}
          >
            <Image
              source={{
                uri:
                  message.sender.profile_img ||
                  "https://via.placeholder.com/40",
              }}
              style={styles.profileImage}
            />
            <View style={styles.messageContent}>
              <Text style={styles.senderName}>
                {message.sender.full_name || "Unknown"}
              </Text>
              <Text style={styles.messageText}>
                {message.text || "No message content"}
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
  messageList: {
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  messageCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 20,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  messageText: {
    fontSize: 16,
    color: "#777777",
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
