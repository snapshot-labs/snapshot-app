import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { useNavigation } from "@react-navigation/native";
import { LANDING_SCREEN } from "../constants/navigation";

function MoreScreen() {
  const connector = useWalletConnect();
  const navigation = useNavigation();
  return (
    <View>
      <TouchableOpacity
        onPress={async () => {
          await connector.killSession();
          navigation.reset({
            index: 0,
            routes: [{ name: LANDING_SCREEN }],
          });
        }}
      >
        <View style={{ marginTop: 60 }}>
          <Text>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default MoreScreen;
