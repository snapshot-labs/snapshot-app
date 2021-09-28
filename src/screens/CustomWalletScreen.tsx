import React, { useState } from "react";
import { Text, View } from "react-native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import common from "../styles/common";
import { AUTH_ACTIONS, useAuthDispatch } from "../context/authContext";
import { HOME_SCREEN, QR_CODE_SCANNER_SCREEN } from "../constants/navigation";
import Button from "../components/Button";
import Input from "../components/Input";

function CustomWalletScreen() {
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState("");
  const authDispatch = useAuthDispatch();
  const navigation: any = useNavigation();

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <Text style={[{ paddingLeft: 16, marginTop: 30 }, common.headerTitle]}>
        {i18n.t("customWalletReadOnly")}
      </Text>
      <Text style={[common.subTitle, { marginTop: 24, paddingLeft: 16 }]}>
        {i18n.t("enterWalletAddress")}
      </Text>
      <Input value={address} onChangeText={(text) => setAddress(text)} />
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
        <Button
          onPress={() => {
            authDispatch({
              type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
              payload: {
                connectedAddress: address,
                addToStorage: true,
              },
            });
            navigation.reset({
              index: 0,
              routes: [{ name: HOME_SCREEN }],
            });
          }}
          title={i18n.t("loginWithThisAddress")}
          disabled={address.trim().length === 0}
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
