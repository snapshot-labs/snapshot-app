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
import i18n from "i18n-js";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { useNavigation } from "@react-navigation/native";
import { Placeholder, PlaceholderMedia, PlaceholderLine } from "rn-placeholder";
import colors from "../constants/colors";
import { convertArrayBufferToHex, generateKey, uuid } from "../util/miscUtils";
import { HOME_SCREEN } from "../constants/navigation";
import { MetaMask } from "../constants/wallets";
import { defaultHeaders } from "../util/apiUtils";
import common from "../styles/common";

const defaultWallets = [MetaMask];

async function fetchWallets(
  setWallets: (wallets: any[]) => void,
  setLoading: (loading: boolean) => void
) {
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
      try {
        const isAppInstalled = await Linking.canOpenURL(
          currentWallet.mobile.native
        );

        if (isAppInstalled) {
          wallets.push(currentWallet);
        }
      } catch (e) {}
    }
  }

  setWallets(wallets);
  setLoading(false);
}

function WalletConnectScreen() {
  const insets = useSafeAreaInsets();
  const [wallets, setWallets] = useState<any[]>([]);
  const connector = useWalletConnect();
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchWallets(setWallets, setLoading);
    setConnected(connector.connected);
  }, []);

  useEffect(() => {
    if (connector.connected && connected !== connector.connect) {
      navigation.navigate(HOME_SCREEN);
    }
  }, [connector.connected]);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: colors.white,
        paddingHorizontal: 16,
      }}
    >
      <Text style={common.headerTitle}>{i18n.t("logIn")}</Text>
      <Text style={[common.subTitle, { marginTop: 16 }]}>
        {i18n.t("connectWallet")}
      </Text>
      {loading ? (
        <Placeholder
          Left={(props) => (
            <PlaceholderMedia isRound={true} style={props.style} size={50} />
          )}
          style={{ alignItems: "center" }}
        >
          <PlaceholderLine width={80} />
        </Placeholder>
      ) : (
        <>
          {wallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.id}
              onPress={async () => {
                const newConnector = await connector.connect();
                const bridge = encodeURIComponent(newConnector.bridge);
                const arrayBufferKey = await generateKey();
                const key = convertArrayBufferToHex(arrayBufferKey, true);
                const handshakeTopic = uuid();
                const createdUri = `wc:${handshakeTopic}@1`;
                const redirectUrl = "org.snapshot";
                newConnector._key = arrayBufferKey;
                const request = newConnector._formatRequest({
                  method: "wc_sessionRequest",
                  params: [
                    {
                      peerId: newConnector.clientId,
                      peerMeta: newConnector.clientMeta,
                      chainId: null,
                    },
                  ],
                });
                newConnector.handshakeId = request.id;
                newConnector.handshakeTopic = handshakeTopic;
                newConnector._sendSessionRequest(
                  request,
                  "Session update rejected",
                  {
                    topic: handshakeTopic,
                  }
                );
                const formattedUri = `${createdUri}?bridge=${bridge}&key=${key}`;

                connector.connectToWalletService(wallet, formattedUri);
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
          {wallets.length === 0 &&
            defaultWallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                onPress={() => {
                  Linking.openURL(wallet.mobile.universal);
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
                    style={{
                      marginRight: 16,
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                    }}
                    resizeMode="contain"
                  />
                  <Text>Get {wallet.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
        </>
      )}
    </View>
  );
}

export default WalletConnectScreen;
