import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Linking,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "i18n-js";
import common from "styles/common";
import IconFont from "components/IconFont";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import Button from "components/Button";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { defaultHeaders } from "helpers/apiUtils";
import get from "lodash/get";
import SendIntentAndroid from "react-native-send-intent";
import WalletConnect from "@walletconnect/client";
import {
  connectToWalletService,
  initialWalletConnectValues,
} from "helpers/walletConnectUtils";
import { convertArrayBufferToHex, generateKey, uuid } from "helpers/miscUtils";
import storage from "helpers/storage";
import { HOME_SCREEN, QR_CODE_SCANNER_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";
import Input from "components/Input";
import Device from "helpers/device";
import { ethers } from "ethers";
import { EXPLORE_ACTIONS, useExploreDispatch } from "context/exploreContext";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
  },
  welcomeText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 28,
    marginTop: 24,
    marginBottom: 16,
  },
  logoWelcomeTextContainer: {
    alignItems: "center",
  },
  snapshotIconContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 6,
  },
  actionButtonContainer: {
    paddingHorizontal: 16,
  },
  selectWalletTitle: {
    marginTop: 16,
    fontSize: 22,
    fontFamily: "Calibre-Semibold",
    textAlign: "center",
  },
  trackWalletSubtitle: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    textAlign: "center",
    marginTop: 4,
  },
  description: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginBottom: 24,
  },
});

async function fetchWallets(setWallets: (wallets: any[]) => void) {
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
}

function WelcomeScreen() {
  const { colors } = useAuthState();
  const [wallets, setWallets] = useState<any[]>([]);
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const authDispatch = useAuthDispatch();
  const navigation = useNavigation();
  const exploreDispatch = useExploreDispatch();

  useEffect(() => {
    fetchWallets(setWallets);
  }, []);

  return (
    <SafeAreaView style={common.screen}>
      <View style={styles.content}>
        <View style={styles.logoWelcomeTextContainer}>
          <View
            style={[
              styles.snapshotIconContainer,
              { borderColor: colors.borderColor },
            ]}
          >
            <IconFont name="snapshot" size={40} color={colors.yellow} />
          </View>
          <Text style={styles.welcomeText}>{i18n.t("welcomeToSnapshot")}</Text>
          <Text style={[styles.description, { color: colors.darkGray }]}>
            {i18n.t("whereDecisionsGetMade")}
          </Text>
        </View>
        <View style={styles.actionButtonContainer}>
          <Button
            onPress={() => {
              bottomSheetModalDispatch({
                type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                payload: {
                  scroll: true,
                  bottomSheetViewComponentProps: {
                    horizontal: true,
                  },
                  TitleComponent: () => {
                    return (
                      <Text style={styles.selectWalletTitle}>
                        {i18n.t("selectWallet")}
                      </Text>
                    );
                  },
                  ModalContent: () => {
                    return (
                      <View>
                        <ScrollView horizontal>
                          {wallets.map((wallet) => {
                            return (
                              <TouchableOpacity
                                key={wallet.id}
                                onPress={async () => {
                                  const newConnector: any = new WalletConnect({
                                    ...initialWalletConnectValues,
                                    session: undefined,
                                  });
                                  const bridge = encodeURIComponent(
                                    newConnector.bridge
                                  );
                                  const arrayBufferKey = await generateKey();
                                  const key = convertArrayBufferToHex(
                                    arrayBufferKey,
                                    true
                                  );
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

                                  newConnector.on(
                                    "connect",
                                    async (error: any, payload: any) => {
                                      if (!error) {
                                        const params = payload.params[0];
                                        const address = params
                                          ? params.accounts[0]
                                          : "";
                                        const lowerCasedAddress =
                                          address.toLowerCase();
                                        const androidAppArray = get(
                                          wallet,
                                          "app.android",
                                          ""
                                        ).split("id=");

                                        let androidAppUrl = get(
                                          androidAppArray,
                                          1,
                                          undefined
                                        );
                                        const connectedWallet = {
                                          name: wallet.name,
                                          address,
                                          androidAppUrl,
                                          mobile: wallet.mobile.native,
                                          walletService: wallet,
                                          session: newConnector.session,
                                        };
                                        bottomSheetModalRef?.current?.close();
                                        storage.save(
                                          storage.KEYS.savedWallets,
                                          JSON.stringify({
                                            [lowerCasedAddress]:
                                              connectedWallet,
                                          })
                                        );
                                        authDispatch({
                                          type: AUTH_ACTIONS.SET_SAVED_WALLETS,
                                          payload: {
                                            [lowerCasedAddress]:
                                              connectedWallet,
                                          },
                                        });
                                        authDispatch({
                                          type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                                          payload: {
                                            connectedAddress: lowerCasedAddress,
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
                                    }
                                  );

                                  if (Platform.OS === "android") {
                                    const androidAppArray = get(
                                      wallet,
                                      "app.android",
                                      ""
                                    ).split("id=");

                                    let androidAppUrl = get(
                                      androidAppArray,
                                      1,
                                      undefined
                                    );

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
                                    connectToWalletService(
                                      wallet,
                                      formattedUri
                                    );
                                  }
                                }}
                              >
                                <View
                                  style={{
                                    marginTop: 16,
                                    marginLeft: 16,
                                    borderColor: colors.borderColor,
                                    borderWidth: 1,
                                    borderRadius: 16,
                                    paddingVertical: 8,
                                    paddingLeft: 8,
                                    paddingRight: 16,
                                    width: 125,
                                  }}
                                >
                                  <Image
                                    source={{
                                      uri: `https://registry.walletconnect.org/logo/md/${wallet.id}.jpeg`,
                                    }}
                                    style={{
                                      marginRight: 16,
                                      width: 28,
                                      height: 28,
                                      borderRadius: 14,
                                      backgroundColor: colors.white,
                                      marginBottom: 8,
                                    }}
                                  />
                                  <Text
                                    style={{
                                      color: colors.textColor,
                                      fontFamily: "Calibre-Semibold",
                                      fontSize: 18,
                                      marginLeft: 4,
                                    }}
                                  >
                                    {wallet.name}
                                  </Text>
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                          <View style={{ width: 100, height: 10 }} />
                        </ScrollView>
                      </View>
                    );
                  },
                  options: [],
                  snapPoints: [10, 185],
                  show: true,
                  key: "connect-wallet",
                  icons: [],
                  initialIndex: 1,
                },
              });
            }}
            title={i18n.t("connectWallet")}
            primary
            Icon={() => (
              <IconFont
                name={"wallet"}
                size={20}
                color={colors.white}
                style={{ marginRight: 6 }}
              />
            )}
          />
          <View style={{ marginVertical: 6 }} />
          <Button
            onPress={() => {
              bottomSheetModalDispatch({
                type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                payload: {
                  scroll: true,
                  bottomSheetViewComponentProps: {
                    horizontal: true,
                  },
                  TitleComponent: () => {
                    return (
                      <View>
                        <Text style={styles.selectWalletTitle}>
                          {i18n.t("trackAnyWallet")}
                        </Text>
                        <Text
                          style={[
                            styles.trackWalletSubtitle,
                            { color: colors.darkGray },
                          ]}
                        >
                          {i18n.t("pasteOrScanYourENSEthereumAddress")}
                        </Text>
                      </View>
                    );
                  },
                  ModalContent: () => {
                    const [trackAddress, setTrackAddress] = useState("");
                    const [error, setError] = useState("");
                    const [loading, setLoading] = useState(false);
                    const [isFocused, setIsFocused] = useState(false);
                    return (
                      <View
                        style={{
                          width: Device.getDeviceWidth(),
                          paddingHorizontal: 16,
                        }}
                      >
                        <View style={{ marginVertical: 16 }}>
                          <Input
                            value={trackAddress}
                            onChangeText={(text) => {
                              setTrackAddress(text);
                            }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholder={i18n.t("ensOrAddress")}
                            placeholderTextColor={colors.darkGray}
                            onFocus={() => {
                              setIsFocused(true);
                            }}
                            onBlur={() => {
                              setIsFocused(false);
                            }}
                            textInputContainerStyle={
                              isFocused
                                ? { borderColor: colors.blueButtonBg }
                                : {}
                            }
                            Icon={() => {
                              return (
                                <TouchableOpacity
                                  onPress={() => {
                                    bottomSheetModalRef?.current?.close();
                                    navigation.navigate(QR_CODE_SCANNER_SCREEN);
                                  }}
                                  style={{ marginLeft: "auto" }}
                                >
                                  <FontAwesome5Icon
                                    name={"qrcode"}
                                    size={20}
                                    color={colors.blueButtonBg}
                                  />
                                </TouchableOpacity>
                              );
                            }}
                          />
                        </View>
                        {error !== "" && (
                          <Text
                            style={{
                              fontFamily: "Calibre-Medium",
                              color: colors.red,
                              paddingHorizontal: 16,
                              paddingBottom: 16,
                            }}
                          >
                            {error}
                          </Text>
                        )}
                        <Button
                          onPress={async () => {
                            setError("");
                            setLoading(true);
                            if (trackAddress.toLowerCase().includes("eth")) {
                              const resolveName = await ethers
                                .getDefaultProvider()
                                .resolveName(trackAddress);
                              if (resolveName) {
                                exploreDispatch({
                                  type: EXPLORE_ACTIONS.SET_PROFILES,
                                  payload: {
                                    [resolveName]: {
                                      ens: trackAddress,
                                    },
                                  },
                                });
                                bottomSheetModalRef?.current?.close();
                                authDispatch({
                                  type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                                  payload: {
                                    connectedAddress: resolveName,
                                    addToStorage: true,
                                    addToSavedWallets: true,
                                  },
                                });
                                setLoading(false);
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: HOME_SCREEN }],
                                });
                              } else {
                                setLoading(false);
                                setError(
                                  i18n.t("unableToFindAssociatedAddress")
                                );
                              }
                            } else {
                              bottomSheetModalRef?.current?.close();
                              authDispatch({
                                type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                                payload: {
                                  connectedAddress: trackAddress,
                                  addToStorage: true,
                                  addToSavedWallets: true,
                                },
                              });
                              setLoading(false);
                              navigation.reset({
                                index: 0,
                                routes: [{ name: HOME_SCREEN }],
                              });
                            }
                          }}
                          title={i18n.t("trackWallet")}
                          disabled={trackAddress.trim().length === 0}
                          loading={loading}
                          primary
                        />
                      </View>
                    );
                  },
                  key: "track-wallet",
                  show: true,
                  snapPoints: [10, Device.isIos() ? 500 : 250],
                  options: [],
                  icons: [],
                },
              });
            }}
            title={i18n.t("trackWallet")}
            Icon={() => (
              <IconFont
                name={"preview"}
                size={24}
                color={colors.textColor}
                style={{ marginRight: 6 }}
              />
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default WelcomeScreen;
