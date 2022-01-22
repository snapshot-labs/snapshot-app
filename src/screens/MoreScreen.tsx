import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18n-js";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CONNECT_ACCOUNT_SCREEN,
  IMPORT_FROM_PRIVATE_KEY_SCREEN,
  LANDING_SCREEN,
  SETTINGS_SCREEN,
  WALLET_SETUP_SCREEN,
} from "constants/navigation";
import common from "styles/common";
import Button from "components/Button";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import { setProfiles } from "helpers/profile";
import ConnectedWallet from "components/ConnectedWallet";
import ActiveAccount from "components/ActiveAccount";
import IconFont from "components/IconFont";
import { useEngineState } from "context/engineContext";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import get from "lodash/get";
import last from "lodash/last";
import SubmitPasswordModal from "components/wallet/SubmitPasswordModal";
import storage from "helpers/storage";
import { SNAPSHOT_WALLET } from "constants/wallets";
import ResetWalletModal from "components/wallet/ResetWalletModal";
import SecureKeychain from "helpers/secureKeychain";

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
  bottomButton: {
    position: "absolute",
    bottom: 0,
    width: width - 32,
    left: 16,
    zIndex: 100,
    paddingTop: 16,
    paddingBottom: 30,
  },
  newWalletLoader: {
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

function MoreScreen() {
  const { keyRingController, passwordSet } = useEngineState();
  const { connectedAddress, savedWallets, wcConnector, colors }: any =
    useAuthState();
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const navigation: any = useNavigation();
  const authDispatch = useAuthDispatch();
  const savedWalletKeys = Object.keys(savedWallets).filter(
    (address: string) => address !== connectedAddress
  );
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const [loadingNewWallet, setLoadingNewWallet] = useState(false);

  useEffect(() => {
    async function checkWallet() {
      if (!keyRingController.isUnlocked()) {
        try {
          const credentials = await SecureKeychain.getGenericPassword();
          if (credentials) {
            keyRingController.submitPassword(credentials.password);
          }
        } catch (e) {
          console.log("KEYCHAIN ERROR", e);
        }
      }
    }

    checkWallet();
  }, [connectedAddress]);

  async function createNewWallet() {
    setLoadingNewWallet(true);
    try {
      const vault = await keyRingController.addNewAccount();
      const accounts = get(keyRingController.state?.keyrings[0], "accounts");
      const latestAddress: string | undefined = last(accounts);
      authDispatch({
        type: AUTH_ACTIONS.SET_SNAPSHOT_WALLETS,
        payload: accounts,
      });

      if (latestAddress) {
        await storage.save(
          storage.KEYS.keyRingControllerState,
          JSON.stringify(vault)
        );
        await storage.save(
          storage.KEYS.snapshotWallets,
          JSON.stringify(accounts)
        );
        const snapshotWallet = {
          name: SNAPSHOT_WALLET,
          address: latestAddress,
        };
        setLoadingNewWallet(false);
        storage.save(
          storage.KEYS.savedWallets,
          JSON.stringify({
            ...savedWallets,
            [latestAddress.toLowerCase()]: snapshotWallet,
          })
        );
        authDispatch({
          type: AUTH_ACTIONS.SET_SAVED_WALLETS,
          payload: {
            ...savedWallets,
            [latestAddress.toLowerCase()]: snapshotWallet,
          },
        });
        authDispatch({
          type: AUTH_ACTIONS.SET_SNAPSHOT_WALLETS,
          payload: accounts,
        });
      } else {
        throw new Error("Unable to get last address");
      }
    } catch (e) {
      setLoadingNewWallet(false);
      bottomSheetModalDispatch({
        type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
        payload: {
          snapPoints: [10, 450],
          initialIndex: 1,
          ModalContent: () => {
            return (
              <SubmitPasswordModal
                onClose={() => {
                  bottomSheetModalRef.current?.close();
                }}
                navigation={navigation}
              />
            );
          },
          show: true,
          key: "submit-password-modal",
        },
      });
    }
  }

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
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <Text
          style={[
            common.screenHeaderTitle,
            {
              color: colors.textColor,
            },
          ]}
        >
          {i18n.t("account")}
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(SETTINGS_SCREEN);
          }}
          style={[{ marginLeft: "auto" }, common.containerHorizontalPadding]}
        >
          <IconFont name="gear" size={30} color={colors.textColor} />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <ActiveAccount address={connectedAddress} />
        {savedWalletKeys.map((address: string) => {
          return <ConnectedWallet address={address} key={address} />;
        })}
        {loadingNewWallet && (
          <View
            style={[
              styles.newWalletLoader,
              {
                borderBottomColor: colors.borderColor,
              },
            ]}
          >
            <ActivityIndicator color={colors.textColor} size="large" />
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(CONNECT_ACCOUNT_SCREEN);
          }}
        >
          <View style={{ marginTop: 16, paddingLeft: 16 }}>
            <Text style={[common.h4, { color: colors.textColor }]}>
              {i18n.t("addWallet")}
            </Text>
          </View>
        </TouchableOpacity>
        {passwordSet ? (
          <>
            <TouchableOpacity
              onPress={() => {
                createNewWallet();
              }}
            >
              <View style={{ marginTop: 24, paddingLeft: 16 }}>
                <Text style={[common.h4, { color: colors.textColor }]}>
                  {i18n.t("createANewWallet")}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                if (keyRingController.isUnlocked()) {
                  navigation.navigate(IMPORT_FROM_PRIVATE_KEY_SCREEN);
                } else {
                  bottomSheetModalDispatch({
                    type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                    payload: {
                      snapPoints: [10, 450],
                      initialIndex: 1,
                      ModalContent: () => {
                        return (
                          <SubmitPasswordModal
                            onClose={() => {
                              bottomSheetModalRef.current?.close();
                            }}
                            navigation={navigation}
                          />
                        );
                      },
                      show: true,
                      key: "submit-password-modal",
                    },
                  });
                }
              }}
            >
              <View style={{ marginTop: 24, paddingLeft: 16 }}>
                <Text style={[common.h4, { color: colors.textColor }]}>
                  {i18n.t("import_private_key.title")}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                bottomSheetModalDispatch({
                  type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                  payload: {
                    snapPoints: [10, 600],
                    initialIndex: 1,
                    ModalContent: () => {
                      return (
                        <ResetWalletModal
                          onClose={() => {
                            bottomSheetModalRef.current?.close();
                          }}
                          navigation={navigation}
                        />
                      );
                    },
                    show: true,
                    key: "reset-wallet-modal",
                  },
                });
              }}
            >
              <View style={{ marginTop: 50, paddingLeft: 16 }}>
                <Text style={[common.h4, { color: colors.red }]}>
                  {i18n.t("resetWallet")}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate(WALLET_SETUP_SCREEN);
            }}
          >
            <View style={{ marginTop: 24, paddingLeft: 16 }}>
              <Text style={[common.h4, { color: colors.textColor }]}>
                {i18n.t("setupWallet")}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={{ width: 100, height: 300 }} />
      </ScrollView>
      <View
        style={[styles.bottomButton, { backgroundColor: colors.bgDefault }]}
      >
        <Button
          onPress={async () => {
            try {
              await wcConnector.killSession();
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
    </SafeAreaView>
  );
}

export default MoreScreen;
