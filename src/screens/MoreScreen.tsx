import React from "react";
import { View } from "react-native";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LANDING_SCREEN } from "../constants/navigation";
import common from "../styles/common";
import Button from "../components/Button";
import { AUTH_ACTIONS, useAuthDispatch } from "../context/authContext";

function MoreScreen() {
  const connector = useWalletConnect();
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();
  const authDispatch = useAuthDispatch();

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
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
