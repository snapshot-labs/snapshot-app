import React, { useEffect, useMemo } from "react";
import { Platform, View, Text, StyleSheet, BackHandler } from "react-native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuthState } from "context/authContext";
import { isOldIphone } from "helpers/phoneUtils";
import FeedScreen from "./FeedScreen";
import * as navigationConstants from "constants/navigation";
import MoreScreen from "./MoreScreen";
import WalletConnectScreen from "./WalletConnectScreen";
import QRCodeScannerScreen from "./QRCodeScannerScreen";
import SpaceScreen from "./SpaceScreen";
import ProposalScreen from "./ProposalScreenNew";
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
import SpaceSettingsScreen from "screens/SpaceSettingsScreen";
import NotificationScreen from "screens/NotificationScreen";
import UserAvatar from "components/UserAvatar";
import colors from "constants/colors";
import { useExploreState } from "context/exploreContext";
import { useNotificationsState } from "context/notificationsContext";
import WalletSetupScreen from "screens/WalletSetupScreen";
import ChoosePasswordScreen from "screens/ChoosePasswordScreen";
import SeedPhraseBackupStep1Screen from "screens/seedPhraseBackup/SeedPhraseBackupStep1Screen";
import SeedPhraseBackupStep2Screen from "screens/seedPhraseBackup/SeedPhraseBackupStep2Screen";
import SeedPhraseBackupCompleteScreen from "screens/seedPhraseBackup/SeedPhraseBackupCompleteScreen";
import ImportFromSeedScreen from "screens/ImportFromSeedScreen";
import QRCodeScreen from "screens/QRCodeScreen";
import ImportFromPrivateKeyScreen from "screens/ImportFromPrivateKeyScreen";
import AccountDetailsScreen from "screens/AccountDetailsScreen";
import ShowPrivateKeyScreen from "screens/ShowPrivateKeyScreen";
import ChangePasswordScreen from "screens/ChangePasswordScreen";
import Device from "helpers/device";
import VoteScreen from "screens/VoteScreen";
import VoteConfirmScreen from "screens/VoteConfirmScreen";
import UserProfileScreen from "screens/UserProfileScreen";
import SnapShotScreen from "screens/SnapShotScreen";
import FollowingScreen from "screens/FollowingScreen";
import FollowersScreen from "screens/FollowersScreen";
import appConstants from "constants/app";
import WelcomeScreen from "screens/WelcomeScreen";
import ExploreScreen from "screens/ExploreScreen";
import AllFeedScreen from "screens/AllFeedScreen";
import ProfileScreen from "screens/ProfileScreen";
import {
  useBottomSheetModalRef,
  useBottomSheetModalShowRef,
} from "context/bottomSheetModalContext";
import { useNavigation } from "@react-navigation/native";
import AddNewAccountScreen from "screens/AddNewAccountScreen";
import SpaceScreenNew from "screens/SpaceScreenNew";

const styles = StyleSheet.create({
  notificationsCircle: {
    height: 20,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  notificationText: {
    fontFamily: "Calibre-Semibold",
    color: colors.bgLightGray,
    fontSize: 11,
    marginTop: Device.isIos() ? 2 : -2,
  },
});

const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();
const ICON_SIZE = 28;

function TabNavigator() {
  const { colors, connectedAddress, followedSpaces } = useAuthState();
  const { profiles } = useExploreState();
  const { proposalTimes, lastViewedProposal, lastViewedNotification } =
    useNotificationsState();
  const unreadNotifications = useMemo(() => {
    if (isEmpty(followedSpaces)) {
      return 0;
    }

    if (isEmpty(lastViewedProposal)) {
      return proposalTimes.length;
    }

    for (let i = 0; i < proposalTimes?.length; i++) {
      if (
        get(proposalTimes[i], "id") === lastViewedProposal &&
        get(proposalTimes[i], "time") === parseInt(lastViewedNotification)
      ) {
        if (i === 0) {
          return 0;
        } else {
          return i;
        }
      }
    }

    return 0;
  }, [
    proposalTimes,
    lastViewedProposal,
    lastViewedNotification,
    connectedAddress,
  ]);
  const profile = profiles[connectedAddress ?? ""];

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          textTransform: "capitalize",
        },
        headerShown: false,
        tabBarActiveTintColor: colors.textColor,
        tabBarStyle: {
          backgroundColor: colors.navBarBg,
          shadowOpacity: 0,
          height: isOldIphone() ? 60 : Platform.OS === "android" ? 68 : 90,
          borderTopWidth: 1,
          borderTopColor: "transparent",
          elevation: 0,
          paddingTop: 12,
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={
          connectedAddress?.toLowerCase() ===
          appConstants.ANONYMOUS_ADDRESS.toLowerCase()
            ? AllFeedScreen
            : FeedScreen
        }
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <IconFont name="home" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <IconFont name="search" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Snapshot"
        component={SnapShotScreen}
        options={{
          title: "",
          tabBarStyle: { display: "none" },
          tabBarIcon: ({ color }) => (
            <View
              style={{
                height: 40,
                width: 40,
                backgroundColor: colors.yellow,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconFont name="snapshot" size={28} color={colors.white} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <View>
              <IconFont
                name={"notifications-none"}
                color={unreadNotifications > 0 ? colors.textColor : color}
                size={ICON_SIZE}
              />
              {unreadNotifications > 0 && (
                <View style={{ position: "absolute", left: 10, top: -2 }}>
                  <View
                    style={[
                      styles.notificationsCircle,
                      {
                        backgroundColor: colors.bgGreen,
                        height: 20,
                      },
                    ]}
                  >
                    <Text style={styles.notificationText}>
                      {unreadNotifications}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={ProfileScreen}
        options={{
          title: "",
          tabBarIcon: ({ color }) =>
            connectedAddress ? (
              <UserAvatar
                size={24}
                address={connectedAddress}
                key={`${connectedAddress}${profile?.image}`}
              />
            ) : (
              <IconFont name="people" color={color} size={ICON_SIZE} />
            ),
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
        component={WelcomeScreen}
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
        component={SpaceScreenNew}
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
      <Stack.Screen
        name={navigationConstants.SPACE_SETTINGS_SCREEN}
        component={SpaceSettingsScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.WALLET_SETUP_SCREEN}
        component={WalletSetupScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.CHOOSE_PASSWORD_SCREEN}
        component={ChoosePasswordScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.CHANGE_PASSWORD_SCREEN}
        component={ChangePasswordScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.SEED_PHRASE_BACKUP_STEP1_SCREEN}
        component={SeedPhraseBackupStep1Screen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.SEED_PHRASE_BACKUP_STEP2_SCREEN}
        component={SeedPhraseBackupStep2Screen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.SEED_PHRASE_BACKUP_COMPLETE_SCREEN}
        component={SeedPhraseBackupCompleteScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.IMPORT_FROM_SEED_SCREEN}
        component={ImportFromSeedScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.QR_CODE_SCREEN}
        component={QRCodeScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.IMPORT_FROM_PRIVATE_KEY_SCREEN}
        component={ImportFromPrivateKeyScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.ACCOUNT_DETAILS_SCREEN}
        component={AccountDetailsScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.SHOW_PRIVATE_KEY_SCREEN}
        component={ShowPrivateKeyScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.VOTE_SCREEN}
        component={VoteScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.VOTE_CONFIRM_SCREEN}
        component={VoteConfirmScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.USER_PROFILE}
        component={UserProfileScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.FOLLOWING_SCREEN}
        component={FollowingScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.FOLLOWERS_SCREEN}
        component={FollowersScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
      <Stack.Screen
        name={navigationConstants.ADD_NEW_ACCOUNT_SCREEN}
        component={AddNewAccountScreen}
        options={{ headerShown: false, ...screenSettings }}
      />
    </Stack.Navigator>
  );
}
