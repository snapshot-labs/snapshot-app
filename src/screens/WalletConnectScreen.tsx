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
import { useWalletConnect } from "@walletconnect/react-native-dapp";

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
      if (Platform.OS === "ios") {
        wallets.push(currentWallet);
      } else {
        const isAppInstalled = await Linking.canOpenURL(
          currentWallet.mobile.native
        );

        if (isAppInstalled) {
          wallets.push(currentWallet);
        }
      }
    }
  }

  setWallets(wallets);
}

function WalletConnectScreen() {
  const insets = useSafeAreaInsets();
  const [wallets, setWallets] = useState<any[]>([]);
  const connector = useWalletConnect();

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
          onPress={async () => {
            const bridge = encodeURIComponent(
              "https://snapshot.bridge.walletconnect.org"
            );
            const uri = `wc?uri=wc:98c9b967-9369-4d17-a2e8-5ca1821cbca0@1&bridge=${bridge}&key=fe5098fe4fb3fa7ae8dbc306860868a4a326cfbe65c59428192edd80ee320349`;
            const redirectUrl = "org.snapshot-app://";
            const url = `${wallet.mobile.native}//${uri}&redirectUrl=${redirectUrl}`;
            const androidUrl = "wc:bfa370d0-02c0-4040-8a1e-3c039bfdeefa@1?bridge=https%3A%2F%2Fj.bridge.walletconnect.org&key=9d8bdd603f85fecd0ec435ef241b509bddda4c5454dd47646e294f47ba68b0cb"
            // console.log({ url });
            // await connector.connect();
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
