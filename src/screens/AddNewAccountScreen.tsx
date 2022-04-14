import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import common from "styles/common";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import ConnectWalletButton from "components/wallet/ConnectWalletButton";
import TrackWalletButton from "components/wallet/TrackWalletButton";
import i18n from "i18n-js";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { useNavigation } from "@react-navigation/native";
import { useEngineState } from "context/engineContext";
import {
  IMPORT_FROM_PRIVATE_KEY_SCREEN,
  WALLET_SETUP_SCREEN,
} from "constants/navigation";
import SubmitPasswordModal from "components/wallet/SubmitPasswordModal";
import ResetWalletModal from "components/wallet/ResetWalletModal";
import get from "lodash/get";
import last from "lodash/last";
import storage from "helpers/storage";
import { SNAPSHOT_WALLET } from "constants/wallets";
import Button from "components/Button";
import BackButton from "components/BackButton";

const styles = StyleSheet.create({
  separator: {
    width: "100%",
    height: 1,
    paddingVertical: 4.5,
  },
});

function AddNewAccountScreen() {
  const { colors, savedWallets } = useAuthState();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const navigation = useNavigation();
  const { keyRingController, passwordSet, preferencesController } =
    useEngineState();
  const authDispatch = useAuthDispatch();
  const [loadingNewWallet, setLoadingNewWallet] = useState(false);
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();

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
        navigation.goBack();
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

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <ScrollView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        <View
          style={[
            common.headerContainer,
            { borderBottomColor: colors.borderColor },
          ]}
        >
          <BackButton title={i18n.t("addNewAccount")} />
        </View>
        <View style={[common.containerHorizontalPadding, { marginTop: 24 }]}>
          <ConnectWalletButton
            onSuccess={() => {
              bottomSheetModalRef.current.close();
              navigation.goBack();
            }}
          />
          <View style={styles.separator} />
          <TrackWalletButton
            onSuccess={() => {
              bottomSheetModalRef.current.close();
              navigation.goBack();
            }}
          />
          <View style={styles.separator} />
          {passwordSet ? (
            <>
              <Button
                onPress={() => {
                  createNewWallet();
                }}
                title={i18n.t("createANewWallet")}
              />
              <View style={styles.separator} />
              <Button
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
                title={i18n.t("import_private_key.title")}
              />
              <View style={styles.separator} />
              <Button
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
                title={i18n.t("resetWallet")}
                buttonTitleStyle={{ color: colors.red }}
              />
            </>
          ) : (
            <Button
              onPress={() => {
                navigation.navigate(WALLET_SETUP_SCREEN);
              }}
              title={i18n.t("setupWallet")}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AddNewAccountScreen;
