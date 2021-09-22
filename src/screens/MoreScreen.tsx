import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useWalletConnect } from "@walletconnect/react-native-dapp";

function MoreScreen() {
  const connector = useWalletConnect();
  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          connector.killSession();
        }}
      >
        <View>
          <Text>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default MoreScreen;
