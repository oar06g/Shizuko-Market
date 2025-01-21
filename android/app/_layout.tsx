import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name='welcome' options={{ title: "Welcome", headerShown: false }} />
      <Stack.Screen name='sign-in' options={{ title: "Sign In", headerShown: false }} />
      <Stack.Screen name='sign-up' options={{ title: "Sign Up", headerShown: false }} />
      <Stack.Screen name='forgotpass' options={{ title: "Forgot Password", headerShown: false }} />
      <Stack.Screen name='screens/details' options={{ title: "Details" }} />
      <Stack.Screen name='screens/create-product' options={{ title: "Create Product" }} />
      <Stack.Screen name='screens/settings' options={{ title: "Settings" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
