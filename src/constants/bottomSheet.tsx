import React from "react";
import { View, Text } from "react-native";
import i18n from "i18n-js";
import get from "lodash/get";
import { AUTH_ACTIONS } from "context/authContext";
import { HOME_SCREEN, LANDING_SCREEN } from "constants/navigation";
import { getAliasWallet } from "helpers/aliasUtils";

export function createBottomSheetParamsForWalletConnectError(
  colors: any,
  bottomSheetModalRef: any,
  authDispatch: any,
  navigation: any,
  savedWallets: any,
  aliases: any,
  connectedAddress: string
) {
  return {
    ModalContent: () => (
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontFamily: "Calibre-Medium",
            color: colors.textColor,
            fontSize: 18,
          }}
        >
          {i18n.t("unableToEstablishWalletConnect")}
        </Text>
      </View>
    ),
    show: true,
    snapPoints: [10, 300],
    initialIndex: 1,
    options: [i18n.t("logout"), i18n.t("cancel")],
    destructiveButtonIndex: 0,
    onPressOption: (index: number) => {
      if (index === 0) {
        const newSavedWallets = { ...savedWallets };
        delete newSavedWallets[connectedAddress];
        if (Object.keys(newSavedWallets).length === 0) {
          authDispatch({
            type: AUTH_ACTIONS.LOGOUT,
          });
          navigation.reset({
            index: 0,
            routes: [{ name: LANDING_SCREEN }],
          });
        } else {
          authDispatch({
            type: AUTH_ACTIONS.SET_OVERWRITE_SAVED_WALLETS,
            payload: newSavedWallets,
          });
          const nextAddress = Object.keys(newSavedWallets)[0];
          const walletName = get(savedWallets, `${nextAddress}.name`);
          const walletProfile = newSavedWallets[nextAddress];
          authDispatch({
            type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
            payload: {
              connectedAddress: nextAddress,
              addToStorage: true,
              isWalletConnect: walletName !== "Custom Wallet",
            },
          });

          if (walletName !== "Custom Wallet" && walletProfile) {
            authDispatch({
              type: AUTH_ACTIONS.SET_WC_CONNECTOR,
              payload: {
                androidAppUrl: walletProfile?.androidAppUrl,
                session: walletProfile?.session,
                walletService: walletProfile?.walletService,
              },
            });
r
            authDispatch({
              type: AUTH_ACTIONS.SET_ALIAS_WALLET,
              payload: aliases[connectedAddress]
                ? getAliasWallet(aliases[connectedAddress])
                : null,
            });
          }
          navigation.reset({
            index: 0,
            routes: [{ name: HOME_SCREEN }],
          });
        }
        bottomSheetModalRef.current?.close();
      } else if (index === 1) {
        bottomSheetModalRef.current?.close();
      }
    },
  };
}
