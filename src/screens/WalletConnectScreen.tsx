import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Linking,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../constants/colors";

const defaultHeaders = {
  accept: "application/json; charset=utf-8",
  "content-type": "application/json; charset=utf-8",
};

async function fetchWallets(setWallets: (wallets: any[]) => void) {
  const options: { [key: string]: any } = {
    method: "get",
    headers: {
      ...defaultHeaders,
    },
  };
  const response = await fetch(
    "https://registry.walletconnect.org/data/wallets.json",
    options
  );
  const walletsMap = await response.json();
  const walletKeys = Object.keys(walletsMap);
  const wallets = [];
  for (let i = 0; i < walletKeys.length; i++) {
    const currentWalletKey = walletKeys[i];
    const currentWallet = walletsMap[currentWalletKey];
    if (currentWallet.mobile.native !== "") {
      const isAppInstalled = await Linking.canOpenURL(
        currentWallet.mobile.native
      );
      if (isAppInstalled) {
        wallets.push(currentWallet);
      }
    }
  }

  setWallets(wallets);
}

function WalletConnectScreen() {
  const insets = useSafeAreaInsets();
  const [wallets, setWallets] = useState<any[]>([]);
  useEffect(() => {
    fetchWallets(setWallets);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: colors.white,
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Log in</Text>
      <Text style={{ fontSize: 20, marginTop: 16, color: colors.darkGray }}>
        Connect Wallet
      </Text>
      {wallets.map((wallet) => (
        <TouchableOpacity
          key={wallet.id}
          onPress={() => {
            const url = `${wallet.mobile.native}/wc`;
            Linking.openURL(url);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <Image
              source={{
                uri: `https://registry.walletconnect.org/logo/md/${wallet.id}.jpeg`,
              }}
              style={{ marginRight: 16, width: 50, height: 50 }}
            />
            <Text>{wallet.name}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default WalletConnectScreen;
