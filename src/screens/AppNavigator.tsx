import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import FontAwesome from "react-native-vector-icons/FontAwesome5";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../context/authContext";
import * as navigationConstants from "../constants/navigation";
import FeedScreen from "./FeedScreen";
import LandingScreen from "./LandingScreen";
import ExploreScreen from "./ExploreScreen";
import HomeScreen from "./HomeScreen";
import MoreScreen from "./MoreScreen";
import WalletConnectScreen from "./WalletConnectScreen";
import QRCodeScannerScreen from "./QRCodeScannerScreen";
import TokenScreen from "./TokenScreen";
import ProposalScreen from "./ProposalScreen";
import CustomWalletScreen from "./CustomWalletScreen";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { LANDING_SCREEN } from "../constants/navigation";
import NetworkScreen from "./NetworkScreen";
import StrategyScreen from "./StrategyScreen";
import VotingRankedChoiceScreen from "./VotingRankedChoiceScreen";

const Stack = createStackNavigator();

const Tab = createMaterialTopTabNavigator();
const ICON_SIZE = 20;
function TabNavigator() {
  const connector = useWalletConnect();
  const authDispatch = useAuthDispatch();
  const [connectorListenersEnabled, setConnectorListenersEnabled] =
    useState(false);
  const navigation: any = useNavigation();

  useEffect(() => {
    if (connector && connector.on && !connectorListenersEnabled) {
      connector.on("disconnect", (error, payload) => {
        if (error) {
          throw error;
        }

        authDispatch({
          type: AUTH_ACTIONS.LOGOUT,
        });
        navigation.reset({
          index: 0,
          routes: [{ name: LANDING_SCREEN }],
        });
      });

      setConnectorListenersEnabled(true);
    }
  }, [connector]);

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={{
        tabBarLabelStyle: {
          textTransform: "capitalize",
        },
        swipeEnabled: false,
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
      <Stack.Screen
        name={navigationConstants.PROPOSAL_SCREEN}
        component={ProposalScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.CUSTOM_WALLET_SCREEN}
        component={CustomWalletScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.NETWORK_SCREEN}
        component={NetworkScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.STRATEGY_SCREEN}
        component={StrategyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
