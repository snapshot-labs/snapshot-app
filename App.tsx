import React, { useState, useEffect } from "react";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import {
  useFonts,
  SpaceMono_700Bold,
  SpaceMono_400Regular,
} from "@expo-google-fonts/space-mono";
import { LogBox } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "context/authContext";
import AppWrapper from "./AppWrapper";
import { toastLayoutConfig } from "constants/toast";
import "./src/i18n";
import { BottomSheetModalProvider } from "context/bottomSheetModalContext";
import { NotificationsProvider } from "context/notificationsContext";
import { EngineProvider } from "context/engineContext";
import SecureKeychain from "helpers/secureKeychain";
import Config from "react-native-config";
import { ExploreProvider } from "context/exploreContext";

LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

let customFonts = {
  "Calibre-Medium": require("./assets/font/Calibre-Medium.ttf"),
  "Calibre-Semibold": require("./assets/font/Calibre-Semibold.ttf"),
};

async function _loadFontsAsync(setFontsLoaded: (fontsLoaded: boolean) => void) {
  await Font.loadAsync(customFonts);
  setFontsLoaded(true);
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  let [fontLoaded] = useFonts({
    SpaceMono_700Bold,
    SpaceMono_400Regular,
  });

  useEffect(() => {
    _loadFontsAsync(setFontsLoaded);
    SecureKeychain.init(Config.SECURE_KEYCHAIN_SALT);
  }, []);

  if (fontsLoaded && fontLoaded) {
    return (
      <SafeAreaProvider>
        <EngineProvider>
          <AuthProvider>
            <ExploreProvider>
              <NotificationsProvider>
                <BottomSheetModalProvider>
                  <AppWrapper />
                </BottomSheetModalProvider>
              </NotificationsProvider>
            </ExploreProvider>
          </AuthProvider>
        </EngineProvider>
        <Toast config={toastLayoutConfig} ref={(ref) => Toast.setRef(ref)} />
      </SafeAreaProvider>
    );
  }

  return <AppLoading />;
}
