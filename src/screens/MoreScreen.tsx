import React, { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import get from "lodash/get";
import {
  CONNECT_ACCOUNT_SCREEN,
  LANDING_SCREEN,
  WALLET_CONNECT_SCREEN,
} from "../constants/navigation";
import common from "../styles/common";
import Button from "../components/Button";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../context/authContext";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import colors from "../constants/colors";
import { explorerUrl, shorten } from "../util/miscUtils";
import Avatar from "../components/Avatar";
import makeBlockie from "ethereum-blockies-base64";
import { useExploreDispatch, useExploreState } from "../context/exploreContext";
import { setProfiles } from "../util/profile";
import { useActionSheet } from "@expo/react-native-action-sheet";
import storage from "../util/storage";

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
  connectedAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    flex: 1,
  },
  connectedEns: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 24,
    marginLeft: 8,
  },
  ens: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
    marginLeft: 8,
  },
  connectedAddress: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 24,
    marginLeft: 8,
  },
  address: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: 8,
  },
  bottomButton: {
    position: "absolute",
    bottom: 30,
    width: width - 32,
    left: 16,
  },
});

function MoreScreen() {
  const { connectedAddress, savedWallets }: any = useAuthState();
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const connector = useWalletConnect();
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();
  const authDispatch = useAuthDispatch();
  const connectedAddressBlockie = makeBlockie(
    connectedAddress ?? "0x000000000000000000000000000000000000dead"
  );
  const { showActionSheetWithOptions } = useActionSheet();
  const profile = profiles[connectedAddress];
  const ens = get(profile, "ens", undefined);
  const savedWalletKeys = Object.keys(savedWallets).filter(
    (address: string) => address !== connectedAddress
  );

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray: string[] = Object.keys(savedWallets);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    if (filteredArray.length > 0) {
      setProfiles(filteredArray, exploreDispatch);
    }
  }, [connectedAddress]);

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <ScrollView style={{ marginTop: 24, flex: 1 }}>
        <Text
          style={[
            common.headerTitle,
            { marginBottom: 16, paddingHorizontal: 16 },
          ]}
        >
          {i18n.t("account")}
        </Text>
        <TouchableHighlight
          underlayColor={colors.highlightColor}
          onPress={() => {
            const options = [
              i18n.t("viewWallet"),
              i18n.t("removeWallet"),
              i18n.t("cancel"),
            ];
            const cancelButtonIndex = options.length - 1;
            const destructiveButtonIndex = options.length - 2;
            showActionSheetWithOptions(
              {
                options,
                cancelButtonIndex,
                destructiveButtonIndex,
                textStyle: { fontFamily: "Calibre-Medium", fontSize: 20 },
              },
              (buttonIndex) => {
                if (buttonIndex === 0) {
                  const url = explorerUrl("1", connectedAddress ?? "");
                  Linking.openURL(url);
                } else if (buttonIndex === destructiveButtonIndex) {
                  const newSavedWallets = { ...savedWallets };
                  const savedWalletKeys = Object.keys(savedWallets);
                  if (savedWalletKeys.length === 1) {
                    try {
                      connector.killSession();
                    } catch (e) {}
                    authDispatch({
                      type: AUTH_ACTIONS.LOGOUT,
                    });
                    navigation.reset({
                      index: 0,
                      routes: [{ name: LANDING_SCREEN }],
                    });
                  } else {
                    const nextWallet = savedWalletKeys.find(
                      (address) => address !== connectedAddress
                    );

                    if (nextWallet) {
                      authDispatch({
                        type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                        payload: {
                          connectedAddress: nextWallet,
                          addToStorage: true,
                        },
                      });
                    } else {
                      authDispatch({
                        type: AUTH_ACTIONS.LOGOUT,
                      });
                    }
                  }

                  delete newSavedWallets[connectedAddress];
                  authDispatch({
                    type: AUTH_ACTIONS.SET_OVERWRITE_SAVED_WALLETS,
                    payload: newSavedWallets,
                  });
                  storage.save(
                    storage.KEYS.savedWallets,
                    JSON.stringify(newSavedWallets)
                  );
                }
              }
            );
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: colors.borderColor,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Avatar
              size={60}
              initialBlockie={connectedAddressBlockie}
              key={connectedAddress}
            />
            <View style={styles.connectedAddressContainer}>
              <View style={{ justifyContent: "center" }}>
                {ens !== undefined && ens !== "" && (
                  <Text style={styles.connectedEns}>{ens}</Text>
                )}
                <Text
                  style={styles.address}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {shorten(connectedAddress ?? "")}
                </Text>
              </View>
              <FontAwesome5Icon
                name="check"
                style={{
                  marginLeft: "auto",
                }}
                size={16}
                color={colors.textColor}
              />
            </View>
          </View>
        </TouchableHighlight>
        {savedWalletKeys.map((address: string) => {
          const blockie = makeBlockie(address);
          const profile = profiles[address];
          const ens = get(profile, "ens", undefined);
          const walletName = get(savedWallets, `${address}.name`);
          return (
            <TouchableHighlight
              underlayColor={colors.highlightColor}
              key={address}
              onPress={() => {
                const options = [
                  i18n.t("useWallet"),
                  i18n.t("viewWallet"),
                  i18n.t("removeWallet"),
                  i18n.t("cancel"),
                ];
                const cancelButtonIndex = options.length - 1;
                const destructiveButtonIndex = options.length - 2;
                showActionSheetWithOptions(
                  {
                    options,
                    cancelButtonIndex,
                    destructiveButtonIndex,
                    textStyle: { fontFamily: "Calibre-Medium", fontSize: 20 },
                  },
                  (buttonIndex) => {
                    if (buttonIndex === 0) {
                      authDispatch({
                        type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                        payload: {
                          connectedAddress: address,
                          addToStorage: true,
                          isWalletConnect: walletName !== "Custom Wallet",
                        },
                      });
                    } else if (buttonIndex === 1) {
                      const url = explorerUrl("1", address ?? "");
                      Linking.openURL(url);
                    } else if (buttonIndex === destructiveButtonIndex) {
                      const newSavedWallets = { ...savedWallets };
                      delete newSavedWallets[address];
                      authDispatch({
                        type: AUTH_ACTIONS.SET_OVERWRITE_SAVED_WALLETS,
                        payload: newSavedWallets,
                      });
                      storage.save(
                        storage.KEYS.savedWallets,
                        JSON.stringify(newSavedWallets)
                      );
                    }
                  }
                );
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderColor,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <Avatar size={40} initialBlockie={blockie} />
                <View style={styles.connectedAddressContainer}>
                  <View>
                    {ens !== undefined && ens !== "" && (
                      <Text style={styles.ens}>{ens}</Text>
                    )}
                    <Text
                      style={styles.address}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {shorten(address ?? "")}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableHighlight>
          );
        })}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(CONNECT_ACCOUNT_SCREEN);
          }}
        >
          <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
            <Text style={common.h4}>{i18n.t("addWallet")}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.bottomButton}>
        <Button
          onPress={async () => {
            try {
              await connector.killSession();
            } catch (e) {}
            authDispatch({
              type: AUTH_ACTIONS.LOGOUT,
            });
            navigation.reset({
              index: 0,
              routes: [{ name: LANDING_SCREEN }],
            });
          }}
          title={i18n.t("logout")}
        />
      </View>
    </View>
  );
}

export default MoreScreen;
