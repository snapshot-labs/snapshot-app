import React, { useEffect, useState } from "react";
import { defaultHeaders } from "helpers/apiUtils";
import {
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import get from "lodash/get";
import SendIntentAndroid from "react-native-send-intent";
import Button from "components/Button";
import Device from "helpers/device";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import i18n from "i18n-js";
import WalletConnect from "@walletconnect/client";
import {
  connectToWalletService,
  initialWalletConnectValues,
} from "helpers/walletConnectUtils";
import { convertArrayBufferToHex, generateKey, uuid } from "helpers/miscUtils";
import storage from "helpers/storage";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { HOME_SCREEN } from "constants/navigation";
import IconFont from "components/IconFont";
import { useNavigation } from "@react-navigation/core";
import { MetaMask } from "constants/wallets";

const defaultWallets = [MetaMask];

const styles = StyleSheet.create({
  walletOption: {
    marginTop: 16,
    marginHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  walletOptionAvatar: {
    marginRight: 9,
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  walletOptionTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  selectWalletTitle: {
    marginTop: 16,
    fontSize: 22,
    fontFamily: "Calibre-Semibold",
    textAlign: "center",
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

interface ConnectWalletButtonProps {
  onSuccess: () => void;
}

function ConnectWalletButton({ onSuccess }: ConnectWalletButtonProps) {
  const { colors, savedWallets } = useAuthState();
  const [wallets, setWallets] = useState<any[]>([]);
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const authDispatch = useAuthDispatch();

  useEffect(() => {
    fetchWallets(setWallets);
  }, []);
  return (
    <Button
      onPress={() => {
        const maxSnapPoint =
          wallets.length > 0 ? wallets.length * 100 + 30 : 250;
        const snapPoint =
          maxSnapPoint > Device.getDeviceHeight() ? "90%" : maxSnapPoint;
        bottomSheetModalDispatch({
          type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
          payload: {
            scroll: true,
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
                  {wallets.length === 0 &&
                    defaultWallets.map((wallet) => (
                      <TouchableOpacity
                        key={wallet.id}
                        onPress={() => {
                          Linking.openURL(wallet.mobile.universal);
                        }}
                      >
                        <View
                          style={[
                            styles.walletOption,
                            { borderColor: colors.borderColor },
                          ]}
                        >
                          <Image
                            source={{
                              uri: `https://registry.walletconnect.org/logo/md/${wallet.id}.jpeg`,
                            }}
                            style={[
                              styles.walletOptionAvatar,
                              {
                                backgroundColor: colors.white,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.walletOptionTitle,
                              {
                                color: colors.textColor,
                              },
                            ]}
                          >
                            {i18n.t("getWallet", {
                              walletName: wallet.name,
                            })}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
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
                                const lowerCasedAddress = address.toLowerCase();
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
                                    ...savedWallets,
                                    [lowerCasedAddress]: connectedWallet,
                                  })
                                );
                                authDispatch({
                                  type: AUTH_ACTIONS.SET_SAVED_WALLETS,
                                  payload: {
                                    ...savedWallets,
                                    [lowerCasedAddress]: connectedWallet,
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

                                onSuccess();
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
                            connectToWalletService(wallet, formattedUri);
                          }
                        }}
                      >
                        <View
                          style={[
                            styles.walletOption,
                            { borderColor: colors.borderColor },
                          ]}
                        >
                          <Image
                            source={{
                              uri: `https://registry.walletconnect.org/logo/md/${wallet.id}.jpeg`,
                            }}
                            style={[
                              styles.walletOptionAvatar,
                              {
                                backgroundColor: colors.white,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.walletOptionTitle,
                              {
                                color: colors.textColor,
                              },
                            ]}
                          >
                            {wallet.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            },
            options: [],
            snapPoints: [10, snapPoint],
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
  );
}

export default ConnectWalletButton;
