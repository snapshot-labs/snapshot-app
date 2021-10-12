import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18n-js";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import SpaceScreen from "./SpaceScreen";
import ProposalScreen from "./ProposalScreen";
import CustomWalletScreen from "./CustomWalletScreen";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { LANDING_SCREEN } from "../constants/navigation";
import NetworkScreen from "./NetworkScreen";
import StrategyScreen from "./StrategyScreen";
import colors from "../constants/colors";
import SettingsScreen from "./SettingsScreen";
import ConnectAccountScreen from "./ConnectAccountScreen";
import VotesScreen from "./VotesScreen";

const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();
const ICON_SIZE = 20;
const BOTTOM_ICON_PADDING = Platform.OS === "android" ? 0 : 30;
const BOTTOM_LABEL_PADDING = Platform.OS === "android" ? 16 : 0;
const TAB_LABEL_FONT_SIZE = 16;

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
      screenOptions={{
        tabBarLabelStyle: {
          textTransform: "capitalize",
        },
        headerShown: false,
        tabBarActiveTintColor: colors.textColor,
        tabBarStyle: {
          padding: 16,
          shadowOpacity: 0,
          height: Platform.OS === "android" ? 75 : 85,
          borderTopWidth: 1,
          borderTopColor: colors.borderColor,
          elevation: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: i18n.t("home"),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name="home"
              color={color}
              size={ICON_SIZE}
              style={{ paddingBottom: BOTTOM_ICON_PADDING }}
            />
          ),
          tabBarLabelStyle: {
            fontFamily: "Calibre-Medium",
            fontSize: TAB_LABEL_FONT_SIZE,
            paddingBottom: BOTTOM_LABEL_PADDING,
          },
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: i18n.t("feed"),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name="rss"
              color={color}
              size={ICON_SIZE}
              style={{ paddingBottom: BOTTOM_ICON_PADDING }}
            />
          ),
          tabBarLabelStyle: {
            fontFamily: "Calibre-Medium",
            fontSize: TAB_LABEL_FONT_SIZE,
            paddingBottom: BOTTOM_LABEL_PADDING,
          },
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: i18n.t("explore"),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name="compass"
              color={color}
              size={ICON_SIZE}
              style={{ paddingBottom: BOTTOM_ICON_PADDING }}
            />
          ),
          tabBarLabelStyle: {
            fontFamily: "Calibre-Medium",
            fontSize: TAB_LABEL_FONT_SIZE,
            paddingBottom: BOTTOM_LABEL_PADDING,
          },
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          title: i18n.t("profile"),
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name="user"
              color={color}
              size={ICON_SIZE}
              style={{ paddingBottom: BOTTOM_ICON_PADDING }}
            />
          ),
          tabBarLabelStyle: {
            fontFamily: "Calibre-Medium",
            fontSize: TAB_LABEL_FONT_SIZE,
            paddingBottom: BOTTOM_LABEL_PADDING,
          },
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
        name={navigationConstants.SPACE_SCREEN}
        component={SpaceScreen}
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
      <Stack.Screen
        name={navigationConstants.SETTINGS_SCREEN}
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.CONNECT_ACCOUNT_SCREEN}
        component={ConnectAccountScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.PROPOSAL_VOTES_SCREEN}
        component={VotesScreen}
        options={{
          headerShown: false,
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
      />
    </Stack.Navigator>
  );
}
