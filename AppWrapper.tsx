import React, { useEffect, useState } from "react";
import { AsyncStorage, Platform, StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "screens/AppNavigator";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { ExploreProvider } from "context/exploreContext";
import storage from "helpers/storage";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { ContextDispatch } from "types/context";
import { getAliasWallet } from "helpers/aliasUtils";
import { CUSTOM_WALLET_NAME } from "constants/wallets";
import WalletConnect from "@walletconnect/client";
import {
  initialWalletConnectValues,
  setWalletConnectListeners,
} from "helpers/walletConnectUtils";
import ENV from "constants/env";

async function loadFromStorage(
  authDispatch: ContextDispatch,
  setLoading: (loading: boolean) => void
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

        const wcConnector = await WalletConnect.init({
          relayProvider: "wss://relay.walletconnect.org",
          storageOptions: {
            asyncStorage: AsyncStorage,
          },
          metadata: initialWalletConnectValues.clientMeta,
          apiKey: ENV.WALLET_CONNECT_API_KEY,
          logger: "debug",
        });

        setWalletConnectListeners(wcConnector, androidAppUrl, walletService);
        authDispatch({
          type: AUTH_ACTIONS.SET_WC_CONNECTOR,
          payload: {
            session: wcConnector,
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
  } catch (e) {}
  setLoading(false);
}

function MainApp() {
  return (
    <ActionSheetProvider>
      <ExploreProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </ExploreProvider>
    </ActionSheetProvider>
  );
}

function AppWrapper() {
  const [loading, setLoading] = useState(true);
  const { theme, colors } = useAuthState();
  const authDispatch = useAuthDispatch();

  useEffect(() => {
    loadFromStorage(authDispatch, setLoading);
  }, []);

  useEffect(() => {
    if (theme === "light") {
      StatusBar.setBarStyle("dark-content");
    } else {
      StatusBar.setBarStyle("light-content");
    }
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(colors.bgDefault);
    }
  }, [theme]);

  if (loading) {
    return <View />;
  }

  return <MainApp />;
}

export default AppWrapper;
