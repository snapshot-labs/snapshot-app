import React from "react";
import Device from "helpers/device";
import { View } from "react-native";
import { useAuthState } from "context/authContext";

function IphoneBottomSafeAreaViewBackground() {
  const { colors } = useAuthState();
  return Device.isIos() ? (
    <View
      style={{
        width: "100%",
        height: 40, // For all devices, even X, XS Max
        position: "absolute",
        bottom: 0,
        left: 0,
        backgroundColor: colors.navBarBg,
        zIndex: 999,
      }}
    />
  ) : (
    <View />
  );
}

export default IphoneBottomSafeAreaViewBackground;
