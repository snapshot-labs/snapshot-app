import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Linking,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "i18n-js";
import { useNavigation } from "@react-navigation/native";
import { Placeholder, PlaceholderMedia, PlaceholderLine } from "rn-placeholder";
import { CUSTOM_WALLET_SCREEN } from "constants/navigation";
import { MetaMask } from "constants/wallets";
import { defaultHeaders } from "helpers/apiUtils";
import common from "styles/common";
import { useAuthDispatch, useAuthState } from "context/authContext";
import SendIntentAndroid from "react-native-send-intent";
import get from "lodash/get";
import ENV from "constants/env";
import {
  connectToWalletService,
  initialWalletConnectValues,
} from "helpers/walletConnectUtils";
import WalletConnect, { CLIENT_EVENTS } from "@walletconnect/client";
import BackButton from "components/BackButton";

const defaultWallets = [MetaMask];

async function fetchWallets(
  setWallets: (wallets: any[]) => void,
  setLoading: (loading: boolean) => void
) {
  const wallets = [];
  try {
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
    for (let i = 0; i < walletKeys.length; i++) {
      const currentWalletKey = walletKeys[i];
      const currentWallet = walletsMap[currentWalletKey];
      if (currentWallet.mobile.native !== "") {
        if (Platform.OS === "android") {
          if (currentWallet.name && currentWallet.name.includes("Rainbow")) {
            continue;
          }
          const androidAppArray = get(currentWallet, "app.android", "").split(
            "id="
          );
          const androidAppUrl = get(androidAppArray, 1, undefined);

          if (androidAppUrl) {
            const isAppInstalled = await SendIntentAndroid.isAppInstalled(
              androidAppUrl
            );
            if (isAppInstalled) {
              wallets.push(currentWallet);
            }
          } else {
            const isAppInstalled = await Linking.canOpenURL(
              currentWallet.mobile.native
            );

            if (isAppInstalled) {
              wallets.push(currentWallet);
            }
          }
        } else {
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
    }
  } catch (e) {}

  setWallets(wallets);
  setLoading(false);
}

function WalletConnectScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAuthState();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation: any = useNavigation();
  const authDispatch = useAuthDispatch();

  useEffect(() => {
    fetchWallets(setWallets, setLoading);
  }, []);

  return (
    <View
      style={[
        common.screen,
        {
          paddingTop: insets.top,
          backgroundColor: colors.bgDefault,
        },
      ]}
    >
      <View
        style={[common.headerContainer, { borderBottomColor: "transparent" }]}
      >
        <BackButton />
      </View>
      <Text
        style={[
          common.headerTitle,
          common.containerHorizontalPadding,
          { color: colors.textColor },
        ]}
      >
        {i18n.t("logIn")}
      </Text>
      <Text
        style={[
          common.subTitle,
          common.containerHorizontalPadding,
          { marginTop: 16 },
        ]}
      >
        {i18n.t("connectWallet")}
      </Text>
      {loading ? (
        <Placeholder
          Left={(props) => (
            <PlaceholderMedia isRound={true} style={props.style} size={50} />
          )}
          style={{
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          <PlaceholderLine width={80} />
        </Placeholder>
      ) : (
        <>
          {wallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.id}
              onPress={async () => {
                try {
                  const newConnector: any = await WalletConnect.init({
                    relayUrl: "wss://relay.walletconnect.org",
                    storageOptions: {
                      asyncStorage: AsyncStorage,
                    },
                    metadata: initialWalletConnectValues.clientMeta,
                    apiKey: ENV.WALLET_CONNECT_API_KEY,
                  });

                  newConnector.on(
                    CLIENT_EVENTS.pairing.proposal,
                    async (proposal: any) => {
                      // uri should be shared with the Wallet either through QR Code scanning or mobile deep linking
                      const { uri } = proposal.signal.params;
                      console.log({ uri, walletId: wallet.name });

                      if (Platform.OS === "android") {
                        const androidAppArray = get(
                          wallet,
                          "app.android",
                          ""
                        ).split("id=");

                        let androidAppUrl = get(androidAppArray, 1, undefined);

                        if (wallet?.name.includes("Rainbow")) {
                          Linking.openURL(wallet?.mobile?.native);
                        } else {
                          if (androidAppUrl) {
                            SendIntentAndroid.openAppWithData(
                              androidAppUrl,
                              uri
                            );
                          }
                        }
                      } else {
                        connectToWalletService(wallet, uri);
                      }
                    }
                  );

                  newConnector.on(
                    CLIENT_EVENTS.pairing.updated,
                    (proposal: any) => {
                      console.log("UPDATED PAIRING", { proposal });
                    }
                  );

                  newConnector.on(
                    CLIENT_EVENTS.pairing.sync,
                    (proposal: any) => {
                      console.log("SYNC PAIRING", { proposal });
                    }
                  );

                  const session = await newConnector.connect({
                    permissions: {
                      blockchain: {
                        chains: ["eip155:1"],
                      },
                      jsonrpc: {
                        methods: [
                          "eth_sendTransaction",
                          "personal_sign",
                          "eth_signTypedData",
                        ],
                      },
                    },
                  });
                } catch (e) {
                  console.log("WCScreen Error", e);
                }
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 16,
                  marginLeft: 16,
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
                    backgroundColor: colors.white,
                  }}
                />
                <Text style={[common.defaultText, { color: colors.textColor }]}>
                  {wallet.name}
                </Text>
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
                    marginLeft: 16,
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
                      backgroundColor: colors.white,
                    }}
                    resizeMode="contain"
                  />
                  <Text style={common.defaultText}>
                    {i18n.t("getWallet", { walletName: wallet.name })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          <View style={{ marginTop: 24, marginLeft: 16 }}>
            <Text style={common.subTitle}>{i18n.t("orUseACustomWallet")}</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(CUSTOM_WALLET_SCREEN);
              }}
            >
              <View>
                <Text style={[common.defaultText, { marginTop: 24 }]}>
                  {i18n.t("customWalletReadOnly")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

export default WalletConnectScreen;
