import React, { useState } from "react";
import { Text, View } from "react-native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import common from "styles/common";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { HOME_SCREEN, QR_CODE_SCANNER_SCREEN } from "constants/navigation";
import Button from "components/Button";
import Input from "components/Input";
import { ethers } from "ethers";
import { EXPLORE_ACTIONS, useExploreDispatch } from "context/exploreContext";
import BackButton from "components/BackButton";

function CustomWalletScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAuthState();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const authDispatch = useAuthDispatch();
  const exploreDispatch = useExploreDispatch();
  const navigation: any = useNavigation();

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
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
          { paddingLeft: 16, marginTop: 0, color: colors.textColor },
        ]}
      >
        {i18n.t("customWalletReadOnly")}
      </Text>
      <Text
        style={[
          common.subTitle,
          { marginTop: 24, paddingLeft: 16, color: colors.textColor },
        ]}
      >
        {i18n.t("enterWalletAddress")}
      </Text>
      <Input
        value={address}
        onChangeText={(text) => setAddress(text)}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text
        style={{
          fontFamily: "Calibre-Medium",
          color: colors.red,
          paddingHorizontal: 16,
        }}
      >
        {error}
      </Text>
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Button
          onPress={async () => {
            setError("");
            setLoading(true);
            if (address.toLowerCase().includes("eth")) {
              const resolveName = await ethers
                .getDefaultProvider()
                .resolveName(address);
              if (resolveName) {
                exploreDispatch({
                  type: EXPLORE_ACTIONS.SET_PROFILES,
                  payload: {
                    [resolveName]: {
                      ens: address,
                    },
                  },
                });
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
                setError(i18n.t("unableToFindAssociatedAddress"));
              }
            } else {
              authDispatch({
                type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                payload: {
                  connectedAddress: address,
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
          title={i18n.t("loginWithThisAddress")}
          disabled={address.trim().length === 0}
          loading={loading}
        />
        <View style={{ marginTop: 24 }}>
          <Button
            onPress={() => {
              navigation.navigate(QR_CODE_SCANNER_SCREEN);
            }}
            title={i18n.t("scanQRCode")}
          />
        </View>
      </View>
    </View>
  );
}

export default CustomWalletScreen;
