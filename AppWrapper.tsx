import React, { useEffect, useState } from "react";
import { Platform, StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import AppNavigator from "screens/AppNavigator";
import storage from "helpers/storage";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { ContextDispatch } from "types/context";
import { getAliasWallet } from "helpers/aliasUtils";
import { CUSTOM_WALLET_NAME } from "constants/wallets";
import {
  NOTIFICATIONS_ACTIONS,
  useNotificationsDispatch,
} from "context/notificationsContext";
import { ENGINE_ACTIONS, useEngineDispatch } from "context/engineContext";
import initializeEngine from "helpers/engineService";
import Device from "helpers/device";

async function loadFromStorage(
  authDispatch: ContextDispatch,
  notificationsDispatch: ContextDispatch,
  setLoading: (loading: boolean) => void,
  engineDispatch: ContextDispatch
) {
  try {
    const connectedAddress: string | null = await storage.load(
      storage.KEYS.connectedAddress
    );
    if (connectedAddress) {
      const savedWallets: any = await storage.load(storage.KEYS.savedWallets);
      let parsedSavedWallets: any = {};
      if (savedWallets) {
        try {
          parsedSavedWallets = JSON.parse(savedWallets);
          authDispatch({
            type: AUTH_ACTIONS.SET_SAVED_WALLETS,
            payload: parsedSavedWallets,
          });
        } catch (e) {}
        const session = parsedSavedWallets[connectedAddress]?.session;
        const androidAppUrl =
          parsedSavedWallets[connectedAddress]?.androidAppUrl;
        const walletService =
          parsedSavedWallets[connectedAddress]?.walletService;
        authDispatch({
          type: AUTH_ACTIONS.SET_WC_CONNECTOR,
          payload: {
            session,
            androidAppUrl,
            walletService,
          },
        });
      }
      authDispatch({
        type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
        payload: {
          connectedAddress,
          addToStorage: false,
          isWalletConnect:
            parsedSavedWallets[connectedAddress]?.name !== CUSTOM_WALLET_NAME,
        },
      });

      const aliases = await storage.load(storage.KEYS.aliases);

      if (aliases) {
        const parsedAliases = JSON.parse(aliases);
        authDispatch({
          type: AUTH_ACTIONS.SET_INITIAL_ALIASES,
          payload: parsedAliases,
        });
        const alias: any = parsedAliases[connectedAddress];
        if (alias) {
          authDispatch({
            type: AUTH_ACTIONS.SET_ALIAS_WALLET,
            payload: getAliasWallet(alias),
          });
        }
      }
    }
    if (Platform.OS === "android") {
      const androidAppUrl = await storage.load(storage.KEYS.androidAppUrl);
      if (androidAppUrl) {
        authDispatch({
          type: AUTH_ACTIONS.SET_CONNECTED_ANDROID_APP_URL,
          payload: androidAppUrl,
        });
      }
    }
    const theme = await storage.load(storage.KEYS.theme);
    if (theme) {
      authDispatch({
        type: AUTH_ACTIONS.SET_THEME,
        payload: theme,
      });
    }
    const lastViewedNotification = await storage.load(
      storage.KEYS.lastViewedNotification
    );
    const lastViewedProposal = await storage.load(
      storage.KEYS.lastViewedProposal
    );
    if (lastViewedNotification) {
      notificationsDispatch({
        type: NOTIFICATIONS_ACTIONS.SET_LAST_VIEWED_NOTIFICATION,
        payload: {
          time: parseInt(lastViewedNotification),
          lastViewedProposal: lastViewedProposal,
        },
      });
    }

    const snapshotWallets = await storage.load(storage.KEYS.snapshotWallets);
    if (snapshotWallets) {
      authDispatch({
        type: AUTH_ACTIONS.SET_SNAPSHOT_WALLETS,
        payload: JSON.parse(snapshotWallets),
      });
    }

    const passwordSet = await storage.load(storage.KEYS.passwordSet);
    if (passwordSet === storage.VALUES.true) {
      engineDispatch({
        type: ENGINE_ACTIONS.PASSWORD_SET,
      });
    }
  } catch (e) {}

  let keyRingControllerState: any = {};
  try {
    const keyRingControllerStateImported = await storage.load(
      storage.KEYS.keyRingControllerState
    );
    if (keyRingControllerStateImported) {
      keyRingControllerState = keyRingControllerStateImported;
    }
  } catch (e) {}

  let preferencesControllerState: any = {};
  try {
    const preferencesControllerStateImported = await storage.load(
      storage.KEYS.preferencesControllerState
    );
    if (preferencesControllerStateImported) {
      preferencesControllerState = preferencesControllerStateImported;
    }
  } catch (e) {}

  initializeEngine(
    engineDispatch,
    keyRingControllerState,
    preferencesControllerState
  );

  setLoading(false);
}

function MainApp() {
  return (
    <ActionSheetProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ActionSheetProvider>
  );
}

function AppWrapper() {
  const [loading, setLoading] = useState(true);
  const { theme, colors } = useAuthState();
  const authDispatch = useAuthDispatch();
  const notificationsDispatch = useNotificationsDispatch();
  const engineDispatch = useEngineDispatch();

  useEffect(() => {
    loadFromStorage(
      authDispatch,
      notificationsDispatch,
      setLoading,
      engineDispatch
    );
  }, []);

  if (loading) {
    return <View />;
  }

  return (
    <>
      <StatusBar
        barStyle={theme === "light" ? "dark-content" : "light-content"}
        backgroundColor={colors.bgDefault}
        translucent={false}
      />
      <MainApp />
    </>
  );
}

export default AppWrapper;
