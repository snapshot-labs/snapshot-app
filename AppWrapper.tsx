import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import colors from "./src/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function AppWrapper() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingHorizontal: 16 },
      ]}
    >
      <Text style={{ fontFamily: "SpaceMono_700Bold", fontSize: 20 }}>
        snapshot
      </Text>
      <Text
        style={{ fontFamily: "Calibre-Medium", fontSize: 75, marginTop: 30 }}
      >
        Where
      </Text>
      <Text style={{ fontFamily: "Calibre-Medium", fontSize: 75 }}>
        Decisions
      </Text>
      <Text style={{ fontFamily: "Calibre-Medium", fontSize: 75 }}>
        get made
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

export default AppWrapper;
