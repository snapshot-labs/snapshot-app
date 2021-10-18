import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import * as Font from "expo-font";
import AppLoading from "expo-app-loading";
import {
  useFonts,
  SpaceMono_700Bold,
  SpaceMono_400Regular,
} from "@expo-google-fonts/space-mono";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/authContext";
import AppWrapper from "./AppWrapper";
import { toastLayoutConfig } from "./src/constants/toast";
import "./src/i18n";

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
  }, []);

  if (fontsLoaded && fontLoaded) {
    return (
      <SafeAreaProvider>
        <AuthProvider>
          <AppWrapper />
        </AuthProvider>
        <Toast config={toastLayoutConfig} ref={(ref) => Toast.setRef(ref)} />
      </SafeAreaProvider>
    );
  }

  return <AppLoading />;
}
