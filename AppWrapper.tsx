import React, { useEffect, useState } from "react";
import { Platform, StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "screens/AppNavigator";
import { withWalletConnect } from "@walletconnect/react-native-dapp";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import BottomSheetModal from "components/BottomSheetModal";

async function loadFromStorage(
  authDispatch: ContextDispatch,
  setLoading: (loading: boolean) => void
) {
  try {
    const connectedAddress: string | null = await storage.load(
      storage.KEYS.connectedAddress
    );
    if (connectedAddress) {
      const isWalletConnect = await storage.load(storage.KEYS.isWalletConnect);
      authDispatch({
        type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
        payload: {
          connectedAddress,
          addToStorage: false,
          isWalletConnect: isWalletConnect === "true",
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

      const savedWallets: any = await storage.load(storage.KEYS.savedWallets);

      if (savedWallets) {
        let parsedSavedWallets: any = {};
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

const WrappedMainApp = withWalletConnect(MainApp, {
  redirectUrl: "org.snapshot",
  clientMeta: {
    description: "Snapshot Mobile App",
    url: "https://snapshot.org",
    icons: [
      "https://raw.githubusercontent.com/snapshot-labs/brand/master/avatar/avatar.png",
    ],
    name: "snapshot",
  },
  storageOptions: {
    //@ts-ignore
    asyncStorage: AsyncStorage,
  },
});

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

  return <WrappedMainApp />;
}

export default AppWrapper;
