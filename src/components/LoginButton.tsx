import React from "react";
import { Text, View } from "react-native";
import colors from "../constants/colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { HOME_SCREEN } from "../constants/navigation";
import { useNavigation } from "@react-navigation/native";

function LoginButton() {
  const connector = useWalletConnect();
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={async () => {
        await connector.connect();
        if (connector.connected) {
          navigation.navigate(HOME_SCREEN);
        }
      }}
      style={{ zIndex: 100 }}
    >
      <View
        style={{
          padding: 16,
          backgroundColor: colors.black,
          borderRadius: 24,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 50,
          zIndex: 100,
        }}
      >
        <Text style={{ color: colors.white }}>Log in</Text>
      </View>
    </TouchableOpacity>
  );
}

export default LoginButton;
