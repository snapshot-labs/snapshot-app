import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import colors from "./src/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWalletConnect } from "react-native-walletconnect";

function AppWrapper() {
  const insets = useSafeAreaInsets();
  const { createSession, killSession, session, signTransaction } =
    useWalletConnect();
  const hasWallet = !!session.length;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingHorizontal: 16 },
      ]}
    >
      <StatusBar style="auto" />
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
      {hasWallet ? (
        <TouchableOpacity onPress={killSession}>
          <View>
            <Text>Disconnect wallet</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={createSession}>
          <View>
            <Text>Connect wallet</Text>
          </View>
        </TouchableOpacity>
      )}
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
