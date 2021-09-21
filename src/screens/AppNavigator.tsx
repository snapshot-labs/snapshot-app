import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as navigationConstants from "../constants/navigation";
import FeedScreen from "./FeedScreen";
import LandingScreen from "./LandingScreen";
import ExploreScreen from "./ExploreScreen";

const Stack = createStackNavigator();

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
    </Tab.Navigator>
  );
}

export default function () {
  return (
    <Stack.Navigator
      initialRouteName={navigationConstants.LANDING_SCREEN}
      screenOptions={{
        headerTitleContainerStyle: { alignItems: "center" },
      }}
    >
      <Stack.Screen
        name={navigationConstants.LANDING_SCREEN}
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={navigationConstants.HOME_SCREEN}
        component={TabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
