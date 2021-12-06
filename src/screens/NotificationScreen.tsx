import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthState } from "../context/authContext";
import common from "../styles/common";
import i18n from "i18n-js";

function NotificationScreen() {
  const { colors } = useAuthState();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <View
        style={{
          backgroundColor: colors.bgDefault,
          paddingBottom: 8,
        }}
      >
        <View style={common.headerContainer}>
          <Text style={[common.screenHeaderTitle, { color: colors.textColor }]}>
            {i18n.t("notifications")}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default NotificationScreen;
