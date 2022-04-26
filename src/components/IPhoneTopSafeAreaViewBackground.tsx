import React from "react";
import Device from "helpers/device";
import { View } from "react-native";
import { useAuthState } from "context/authContext";

function IPhoneTopSafeAreaViewBackground() {
  const { colors } = useAuthState();
  return Device.isIos() ? (
    <View
      style={{
        width: "100%",
        height: 50, // For all devices, even X, XS Max
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: colors.bgDefault,
        zIndex: 999,
      }}
    />
  ) : (
    <View />
  );
}

export default IPhoneTopSafeAreaViewBackground;
