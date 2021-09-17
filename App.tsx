import React, { useState } from "react";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import { useEffect } from "react";
import {
  useFonts,
  SpaceMono_700Bold,
  SpaceMono_400Regular,
} from "@expo-google-fonts/space-mono";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppWrapper from "./AppWrapper";
import WalletConnectProvider from "react-native-walletconnect";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

let customFonts = {
  "Calibre-Medium": require("./assets/font/Calibre-Medium.ttf"),
  "Calibre-Semibold": require("./assets/font/Calibre-Semibold.ttf"),
};

async function _loadFontsAsync(setFontsLoaded: (fontsLoaded: boolean) => void) {
  await Font.loadAsync(customFonts);
  setFontsLoaded(true);
}

function getInitialUrl() {
  return Linking.createURL("/login");
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  let [fontLoaded] = useFonts({
    SpaceMono_700Bold,
    SpaceMono_400Regular,
  });

  useEffect(() => {
    _loadFontsAsync(setFontsLoaded);
  }, []);


  if (fontsLoaded && fontLoaded) {
    return (
      <SafeAreaProvider>
        <WalletConnectProvider
          redirectUrl={getInitialUrl()}
          storageOptions={{
            asyncStorage: AsyncStorage,
          }}
        >
          <AppWrapper />
        </WalletConnectProvider>
      </SafeAreaProvider>
    );
  }

  return <AppLoading />;
}
