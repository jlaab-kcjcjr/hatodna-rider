import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, YoungSerif_400Regular } from '@expo-google-fonts/young-serif';
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_800ExtraBold } from '@expo-google-fonts/figtree';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS, FONTS } from './src/theme';
import LoginScreen from './src/screens/LoginScreen';
import OtpScreen from './src/screens/OtpScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PendingScreen from './src/screens/PendingScreen';
import JobsScreen from './src/screens/JobsScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Jobs: ['bicycle', 'bicycle-outline'],
  Earnings: ['wallet', 'wallet-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.sili,
        tabBarInactiveTintColor: COLORS.inkSoft,
        tabBarLabelStyle: { fontFamily: FONTS.semi, fontSize: 12 },
        tabBarStyle: { borderTopColor: COLORS.line, backgroundColor: COLORS.surface },
        tabBarIcon: ({ color, size, focused }) => {
          const [on, off] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? on : off} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Jobs" component={JobsScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Shows a different part of the app depending on where the rider is in the process.
function RootNavigator() {
  const { user, application } = useAuth();

  let screens;
  if (!user) {
    screens = (
      <>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Otp" component={OtpScreen} options={{ title: '' }} />
      </>
    );
  } else if (!application) {
    screens = <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />;
  } else if (application.status === 'pending') {
    screens = <Stack.Screen name="Pending" component={PendingScreen} options={{ headerShown: false }} />;
  } else {
    screens = <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: COLORS.ink,
        headerTitleStyle: { fontFamily: FONTS.semi },
        headerStyle: { backgroundColor: COLORS.page },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      {screens}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    YoungSerif_400Regular,
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.page }}>
        <ActivityIndicator color={COLORS.sili} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}