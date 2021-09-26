import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import FontAwesome from "react-native-vector-icons/FontAwesome5";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import * as navigationConstants from "../constants/navigation";
import FeedScreen from "./FeedScreen";
import LandingScreen from "./LandingScreen";
import ExploreScreen from "./ExploreScreen";
import HomeScreen from "./HomeScreen";
import MoreScreen from "./MoreScreen";
import WalletConnectScreen from "./WalletConnectScreen";

const Stack = createStackNavigator();

const Tab = createMaterialTopTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator tabBarPosition="bottom">
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="rss" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="compass" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="ellipsis-h" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function () {
  const connector = useWalletConnect();
  return (
    <Stack.Navigator
      initialRouteName={navigationConstants.LANDING_SCREEN}
      screenOptions={{
        headerTitleContainerStyle: { alignItems: "center" },
      }}
    >
      {connector.connected && (
        <Stack.Screen
          name={navigationConstants.HOME_SCREEN}
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      )}
      <Stack.Screen
        name={navigationConstants.LANDING_SCREEN}
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.WALLET_CONNECT_SCREEN}
        component={WalletConnectScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
