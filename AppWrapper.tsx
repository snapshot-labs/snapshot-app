import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import colors from "./src/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnect from "@walletconnect/client";

async function getWallets() {
  const options = {
    method: "get",
  };
  const url = "https://registry.walletconnect.org/data/wallets.json";
  const result = await fetch(url, options);
  const responseJson = await result.json();
  const keys = Object.keys(responseJson);
  for (let i = 0; i < keys.length; i++) {
    const currentWallet = responseJson[keys[i]];

    if (currentWallet.mobile.native !== "") {
      const canOpenUrl = await Linking.canOpenURL(
        `${currentWallet.mobile.native}`
      );
      console.log(currentWallet.name, canOpenUrl);
    }
  }
}

function AppWrapper() {
  const insets = useSafeAreaInsets();
  const hasWallet = false;

  useEffect(() => {
    getWallets();
  }, []);

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
        <TouchableOpacity onPress={() => {}}>
          <View>
            <Text>Disconnect wallet</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => {
            // bridge url
            const bridge = "https://bridge.walletconnect.org";

            // create new connector
            const connector = new WalletConnect({
              bridge,
              qrcodeModal: QRCodeModal,
            });
          }}
        >
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
