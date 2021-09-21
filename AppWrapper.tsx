import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/screens/AppNavigator";
import { withWalletConnect } from "@walletconnect/react-native-dapp";
import AsyncStorage from "@react-native-async-storage/async-storage";

function AppWrapper() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default withWalletConnect(AppWrapper, {
  redirectUrl: "org.snapshot",
  storageOptions: {
    asyncStorage: AsyncStorage,
  },
});
