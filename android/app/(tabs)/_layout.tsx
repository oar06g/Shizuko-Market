import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E91E63', // لون الأيقونة عند التفعيل
        tabBarInactiveTintColor: '#9E9E9E', // لون الأيقونة عند عدم التفعيل
        headerStyle: {
          backgroundColor: '#880E4F', // خلفية الرأس
        },
        headerShadowVisible: false,
        headerTintColor: '#FFFFFF', // لون النص في الرأس
        tabBarStyle: {
          backgroundColor: '#25292E', // خلفية التبويبات
          borderTopWidth: 0,
          elevation: 5,
        },
      }}
    >
      {/* Home Screen */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home-sharp' : 'home-outline'} // أيقونة التفعيل
              color={color}
              size={24}
            />
          ),
        }}
      />

      {/* About Screen */}
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            // <Ionicons
            //   name={focused ? 'notifications' : 'information-circle-outline'}
            //   color={color}
            //   size={24}
            // />
            <MaterialCommunityIcons name={focused ? "message": "message-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* Profile Screen */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
