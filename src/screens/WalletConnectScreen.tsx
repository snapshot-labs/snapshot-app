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
import { useNavigation } from "@react-navigation/native";
import { Placeholder, PlaceholderMedia, PlaceholderLine } from "rn-placeholder";
import { CUSTOM_WALLET_SCREEN, HOME_SCREEN } from "constants/navigation";
import { MetaMask } from "constants/wallets";
import { defaultHeaders } from "helpers/apiUtils";
import common from "styles/common";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { generateKey, convertArrayBufferToHex, uuid } from "helpers/miscUtils";
import SendIntentAndroid from "react-native-send-intent";
import get from "lodash/get";
import storage from "helpers/storage";
import {
  connectToWalletService,
  initialWalletConnectValues,
} from "helpers/walletConnectUtils";
import WalletConnect from "@walletconnect/client";
import BackButton from "components/BackButton";

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
                const newConnector: any = new WalletConnect({
                  ...initialWalletConnectValues,
                  session: undefined,
                });
                const bridge = encodeURIComponent(newConnector.bridge);
                const arrayBufferKey = await generateKey();
                const key = convertArrayBufferToHex(arrayBufferKey, true);
                const handshakeTopic = uuid();
                const createdUri = `wc:${handshakeTopic}@1`;
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

                newConnector.on("connect", async (error: any, payload: any) => {
                  if (!error) {
                    const params = payload.params[0];
                    const address = params ? params.accounts[0] : "";
                    const androidAppArray = get(
                      wallet,
                      "app.android",
                      ""
                    ).split("id=");

                    let androidAppUrl = get(androidAppArray, 1, undefined);
                    const connectedWallet = {
                      name: wallet.name,
                      address,
                      androidAppUrl,
                      mobile: wallet.mobile.native,
                      walletService: wallet,
                      session: newConnector.session,
                    };

                    storage.save(
                      storage.KEYS.savedWallets,
                      JSON.stringify({
                        [address]: connectedWallet,
                      })
                    );
                    authDispatch({
                      type: AUTH_ACTIONS.SET_SAVED_WALLETS,
                      payload: {
                        [address]: connectedWallet,
                      },
                    });
                    authDispatch({
                      type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                      payload: {
                        connectedAddress: address,
                        isWalletConnect: true,
                        addToStorage: true,
                      },
                    });
                    authDispatch({
                      type: AUTH_ACTIONS.SET_WC_CONNECTOR,
                      payload: {
                        newConnector: newConnector,
                        androidAppUrl: androidAppUrl,
                        walletService: wallet,
                      },
                    });
                    navigation.reset({
                      index: 0,
                      routes: [{ name: HOME_SCREEN }],
                    });
                  }
                });

                if (Platform.OS === "android") {
                  const androidAppArray = get(wallet, "app.android", "").split(
                    "id="
                  );

                  let androidAppUrl = get(androidAppArray, 1, undefined);

                  if (wallet.name.includes("Rainbow")) {
                    Linking.openURL(wallet.mobile.native);
                  } else {
                    if (androidAppUrl) {
                      SendIntentAndroid.openAppWithData(
                        androidAppUrl,
                        formattedUri
                      );
                    }
                  }
                } else {
                  connectToWalletService(wallet, formattedUri);
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
