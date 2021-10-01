import React, { useEffect, useState } from "react";
import { Platform, StatusBar, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/screens/AppNavigator";
import {
  useWalletConnect,
  withWalletConnect,
} from "@walletconnect/react-native-dapp";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

import { ExploreProvider } from "./src/context/exploreContext";
import storage from "./src/util/storage";
import { AUTH_ACTIONS, useAuthDispatch } from "./src/context/authContext";
import { ContextDispatch } from "./src/types/context";
import { getAliasWallet, getRandomAliasWallet } from "./src/util/aliasUtils";

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
  const authDispatch = useAuthDispatch();

  useEffect(() => {
    loadFromStorage(authDispatch, setLoading);
    StatusBar.setBarStyle("dark-content", true);
  }, []);

  if (loading) {
    return <View />;
  }

  return <WrappedMainApp />;
}

export default AppWrapper;
