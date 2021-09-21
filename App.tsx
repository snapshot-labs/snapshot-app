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
        <AppWrapper />
      </SafeAreaProvider>
    );
  }

  return <AppLoading />;
}
