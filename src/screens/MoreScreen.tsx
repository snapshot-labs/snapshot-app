import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import ActivityIndicator from "components/ActivityIndicator";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18n-js";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CONNECT_ACCOUNT_SCREEN,
  HOME_SCREEN,
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
import { CUSTOM_WALLET_NAME, SNAPSHOT_WALLET } from "constants/wallets";
import ResetWalletModal from "components/wallet/ResetWalletModal";
import SecureKeychain from "helpers/secureKeychain";
import { addressIsSnapshotWallet } from "helpers/address";
import { getAliasWallet } from "helpers/aliasUtils";
import {
  NOTIFICATIONS_ACTIONS,
  useNotificationsDispatch,
} from "context/notificationsContext";
import ConnectWalletButton from "components/wallet/ConnectWalletButton";
import TrackWalletButton from "components/wallet/TrackWalletButton";
import { ethers } from "ethers";

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
  const { keyRingController, passwordSet, preferencesController } =
    useEngineState();
  const {
    connectedAddress,
    savedWallets,
    wcConnector,
    colors,
    snapshotWallets,
    isWalletConnect,
    aliases,
  }: any = useAuthState();
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const navigation: any = useNavigation();
  const authDispatch = useAuthDispatch();
  const savedWalletKeys = Object.keys(savedWallets).filter(
    (address: string) =>
      address.toLowerCase() !== connectedAddress.toLowerCase()
  );
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const notificationsDispatch = useNotificationsDispatch();
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
      return (
        !profilesArray.includes(address.toLowerCase()) &&
        ethers.utils.isAddress(address)
      );
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
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <ConnectWalletButton
            onSuccess={() => {
              bottomSheetModalRef.current.close();
            }}
          />
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <TrackWalletButton
            onSuccess={() => {
              bottomSheetModalRef.current.close();
            }}
          />
        </View>
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
                      options: [],
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
                    options: [],
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
            const isSnapshotWallet = addressIsSnapshotWallet(
              connectedAddress,
              snapshotWallets
            );

            if (isSnapshotWallet) {
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
                  options: [],
                  show: true,
                  key: "reset-wallet-modal",
                },
              });
            } else {
              const newSavedWallets = { ...savedWallets };
              delete newSavedWallets[connectedAddress.toLowerCase()];

              try {
                if (isWalletConnect) {
                  await wcConnector.killSession();
                }
              } catch (e) {}

              authDispatch({
                type: AUTH_ACTIONS.SET_OVERWRITE_SAVED_WALLETS,
                payload: newSavedWallets,
              });
              storage.save(
                storage.KEYS.savedWallets,
                JSON.stringify(newSavedWallets)
              );

              const savedWalletKeys = Object.keys(newSavedWallets);

              if (savedWalletKeys.length === 0) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: LANDING_SCREEN }],
                });
                authDispatch({
                  type: AUTH_ACTIONS.LOGOUT,
                });
              } else {
                const nextAddress = savedWalletKeys[0];
                const walletProfile =
                  newSavedWallets[nextAddress.toLowerCase()];
                const walletName = get(walletProfile, "name");
                const isWalletConnect =
                  walletName !== CUSTOM_WALLET_NAME &&
                  walletName !== SNAPSHOT_WALLET;

                if (walletName === SNAPSHOT_WALLET) {
                  await preferencesController.setSelectedAddress(nextAddress);
                  storage.save(
                    storage.KEYS.preferencesControllerState,
                    JSON.stringify(preferencesController.state)
                  );
                }

                authDispatch({
                  type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                  payload: {
                    connectedAddress: nextAddress,
                    addToStorage: true,
                    isWalletConnect,
                  },
                });

                if (isWalletConnect) {
                  authDispatch({
                    type: AUTH_ACTIONS.SET_WC_CONNECTOR,
                    payload: {
                      androidAppUrl: walletProfile?.androidAppUrl,
                      session: walletProfile?.session,
                      walletService: walletProfile?.walletService,
                    },
                  });
                }

                if (isWalletConnect || isSnapshotWallet) {
                  authDispatch({
                    type: AUTH_ACTIONS.SET_ALIAS_WALLET,
                    payload: aliases[nextAddress]
                      ? getAliasWallet(aliases[nextAddress])
                      : null,
                  });
                }

                notificationsDispatch({
                  type: NOTIFICATIONS_ACTIONS.RESET_PROPOSAL_TIMES,
                });
                notificationsDispatch({
                  type: NOTIFICATIONS_ACTIONS.RESET_LAST_VIEWED_NOTIFICATION,
                });
              }
            }
          }}
          title={i18n.t("logout")}
        />
      </View>
    </SafeAreaView>
  );
}

export default MoreScreen;
