import React from "react";
import IconButton from "components/IconButton";
import { View } from "react-native";
import { addressIsSnapshotWallet } from "helpers/address";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import ResetWalletModal from "components/wallet/ResetWalletModal";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import storage from "helpers/storage";
import { LANDING_SCREEN } from "constants/navigation";
import get from "lodash/get";
import { CUSTOM_WALLET_NAME, SNAPSHOT_WALLET } from "constants/wallets";
import { getAliasWallet } from "helpers/aliasUtils";
import {
  NOTIFICATIONS_ACTIONS,
  useNotificationsDispatch,
} from "context/notificationsContext";
import { useNavigation } from "@react-navigation/core";
import { useEngineState } from "context/engineContext";

function LogoutButton() {
  const {
    connectedAddress,
    savedWallets,
    wcConnector,
    snapshotWallets,
    isWalletConnect,
    aliases,
  }: any = useAuthState();
  const navigation: any = useNavigation();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const notificationsDispatch = useNotificationsDispatch();
  const { preferencesController } = useEngineState();
  const authDispatch = useAuthDispatch();

  return (
    <IconButton
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
            const walletProfile = newSavedWallets[nextAddress.toLowerCase()];
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
      name="login"
    />
  );
}

export default LogoutButton;
