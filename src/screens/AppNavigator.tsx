import React from "react";
import { Platform } from "react-native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import i18n from "i18n-js";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthState } from "context/authContext";
import { isOldIphone } from "helpers/phoneUtils";
import FeedScreen from "./FeedScreen";
import * as navigationConstants from "constants/navigation";
import LandingScreen from "./LandingScreen";
import ExploreScreen from "./ExploreScreen";
import HomeScreen from "./HomeScreen";
import MoreScreen from "./MoreScreen";
import WalletConnectScreen from "./WalletConnectScreen";
import QRCodeScannerScreen from "./QRCodeScannerScreen";
import SpaceScreen from "./SpaceScreen";
import ProposalScreen from "./ProposalScreen";
import CustomWalletScreen from "./CustomWalletScreen";
import NetworkScreen from "./NetworkScreen";
import StrategyScreen from "./StrategyScreen";
import SettingsScreen from "./SettingsScreen";
import ConnectAccountScreen from "./ConnectAccountScreen";
import VotesScreen from "./VotesScreen";
import CreateProposalScreen from "./CreateProposalScreen";
import IconFont from "../components/IconFont";
import AboutScreen from "screens/AboutScreen";
import AdvancedSettingsScreen from "screens/AdvancedSettingsScreen";

const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();
const ICON_SIZE = 28;
const BOTTOM_ICON_PADDING = Platform.OS === "android" ? 0 : 30;
const BOTTOM_LABEL_PADDING = isOldIphone()
  ? 8
  : Platform.OS === "android"
  ? 16
  : 0;
const TAB_LABEL_FONT_SIZE = 16;

function TabNavigator() {
  const { colors } = useAuthState();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          textTransform: "capitalize",
        },
        headerShown: false,
        tabBarActiveTintColor: colors.textColor,
        tabBarStyle: {
          backgroundColor: colors.bgDefault,
          padding: 16,
          shadowOpacity: 0,
          height: isOldIphone() ? 60 : Platform.OS === "android" ? 75 : 95,
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
            <IconFont
              name="snapshot"
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
            <IconFont
              name="feed"
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
            <IconFont
              name="stars"
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
            <IconFont
              name="people"
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

const screenSettings =
  Platform.OS === "android"
    ? {
        cardStyle: { backgroundColor: "transparent" },
        cardStyleInterpolator: ({ current: { progress } }: any) => ({
          cardStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
          overlayStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
              extrapolate: "clamp",
            }),
          },
        }),
      }
    : {};

export default function () {
  const { connectedAddress, colors } = useAuthState();
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
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.HOME_SCREEN}
        component={TabNavigator}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.WALLET_CONNECT_SCREEN}
        component={WalletConnectScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.QR_CODE_SCANNER_SCREEN}
        component={QRCodeScannerScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.SPACE_SCREEN}
        component={SpaceScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.PROPOSAL_SCREEN}
        component={ProposalScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.CUSTOM_WALLET_SCREEN}
        component={CustomWalletScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.NETWORK_SCREEN}
        component={NetworkScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.STRATEGY_SCREEN}
        component={StrategyScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.SETTINGS_SCREEN}
        component={SettingsScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.CONNECT_ACCOUNT_SCREEN}
        component={ConnectAccountScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.PROPOSAL_VOTES_SCREEN}
        component={VotesScreen}
        options={{
          headerShown: false,
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
      />
      <Stack.Screen
        name={navigationConstants.CREATE_PROPOSAL_SCREEN}
        component={CreateProposalScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.ABOUT_SCREEN}
        component={AboutScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.ADVANCED_SETTINGS_SCREEN}
        component={AdvancedSettingsScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
    </Stack.Navigator>
  );
}
