import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import FontAwesome from "react-native-vector-icons/FontAwesome5";
import { useAuthState } from "../context/authContext";
import * as navigationConstants from "../constants/navigation";
import FeedScreen from "./FeedScreen";
import LandingScreen from "./LandingScreen";
import ExploreScreen from "./ExploreScreen";
import HomeScreen from "./HomeScreen";
import MoreScreen from "./MoreScreen";
import WalletConnectScreen from "./WalletConnectScreen";
import QRCodeScannerScreen from "./QRCodeScannerScreen";
import TokenScreen from "./TokenScreen";

const Stack = createStackNavigator();

const Tab = createMaterialTopTabNavigator();
const ICON_SIZE = 20;
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        tabBarLabelStyle: {
          textTransform: "capitalize",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: "Feed",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="rss" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="compass" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: "More",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="ellipsis-h" color={color} size={ICON_SIZE} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function () {
  const { connectedAddress } = useAuthState();
  return (
    <Stack.Navigator
      initialRouteName={
        connectedAddress !== null
          ? navigationConstants.HOME_SCREEN
          : navigationConstants.LANDING_SCREEN
      }
      screenOptions={{
        headerTitleContainerStyle: { alignItems: "center" },
      }}
    >
      <Stack.Screen
        name={navigationConstants.LANDING_SCREEN}
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.HOME_SCREEN}
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.WALLET_CONNECT_SCREEN}
        component={WalletConnectScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.QR_CODE_SCANNER_SCREEN}
        component={QRCodeScannerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.TOKEN_SCREEN}
        component={TokenScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
