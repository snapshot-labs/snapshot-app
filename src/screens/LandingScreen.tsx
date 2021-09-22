import React from "react";
import { Text, View } from "react-native";
import LoginButton from "../components/LoginButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function LandingScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: insets.top }}>
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 20 }}>
        snapshot
      </Text>
      <Text
        style={{ fontFamily: "SpaceMono_700Bold", fontSize: 60, marginTop: 30 }}
      >
        Where
      </Text>
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 60 }}>
        decision
      </Text>
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 60 }}>
        get made
      </Text>
      <LoginButton />
    </View>
  );
}

export default LandingScreen;
