import React from "react";
import IconButton from "components/IconButton";
import { Text, View, StyleSheet } from "react-native";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";
import common from "styles/common";
import ConnectedWalletOption from "components/profile/ConnectedWalletOption";
import Device from "helpers/device";
import Button from "components/Button";
import { ADD_NEW_ACCOUNT_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  connectedSubtitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
    marginTop: 34,
    marginBottom: 34,
    textTransform: "uppercase",
  },
  separator: {
    width: "100%",
    height: 1,
    marginVertical: 22,
  },
});

function AccountsButton() {
  const { colors, connectedAddress, savedWallets } = useAuthState();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const savedWalletKeys = Object.keys(savedWallets).filter(
    (address: string) =>
      address.toLowerCase() !== connectedAddress?.toLowerCase()
  );
  const navigation = useNavigation();
  const bottomSheetModalRef = useBottomSheetModalRef();

  return (
    <IconButton
      onPress={() => {
        const maxSnapPoint = 370 + savedWalletKeys.length * 58;
        const snapPoint =
          maxSnapPoint > Device.getDeviceHeight() ? "100%" : maxSnapPoint;
        bottomSheetModalDispatch({
          type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
          payload: {
            scroll: true,
            TitleComponent: () => {
              return (
                <Text style={[common.modalTitle, { color: colors.textColor }]}>
                  {i18n.t("accounts")}
                </Text>
              );
            },
            ModalContent: () => {
              return (
                <View style={common.containerHorizontalPadding}>
                  <Text
                    style={[
                      styles.connectedSubtitle,
                      { color: colors.textColor },
                    ]}
                  >
                    {i18n.t("connected")}
                  </Text>
                  <ConnectedWalletOption
                    address={connectedAddress ?? ""}
                    isConnected
                  />
                  <View
                    style={[
                      styles.separator,
                      savedWalletKeys.length > 0
                        ? { backgroundColor: colors.borderColor }
                        : { backgroundColor: "transparent" },
                    ]}
                  />
                  {savedWalletKeys.map((address: string, i: number) => {
                    return (
                      <View key={address}>
                        <ConnectedWalletOption
                          address={address}
                          key={address}
                        />
                        <View
                          style={[
                            styles.separator,
                            i !== savedWalletKeys.length - 1
                              ? { backgroundColor: colors.borderColor }
                              : { backgroundColor: "transparent" },
                          ]}
                        />
                      </View>
                    );
                  })}
                  <Button
                    onPress={() => {
                      navigation.navigate(ADD_NEW_ACCOUNT_SCREEN);
                      bottomSheetModalRef?.current?.close();
                    }}
                    title={i18n.t("addNewAccount")}
                  />
                </View>
              );
            },
            options: [],
            snapPoints: [10, snapPoint],
            show: true,
            key: "view-connected-accounts",
            icons: [],
            initialIndex: 1,
          },
        });
      }}
      name="wallet"
    />
  );
}

export default AccountsButton;
