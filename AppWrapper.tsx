import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/screens/AppNavigator";

function AppWrapper() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default AppWrapper;
