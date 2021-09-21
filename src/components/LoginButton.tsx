import React from "react";
import { HOME_SCREEN } from "../constants/navigation";
import { Text, View } from "react-native";
import colors from "../constants/colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

function LoginButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(HOME_SCREEN);
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
