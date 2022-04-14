import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthState } from "context/authContext";
import common from "styles/common";
import i18n from "i18n-js";
import IconButton from "components/IconButton";

function ProfileScreen() {
  const { colors } = useAuthState();
  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.containerHorizontalPadding,
          common.row,
          common.justifySpaceBetween,
        ]}
      >
        <Text style={[common.h1, { color: colors.textColor }]}>
          {i18n.t("profile")}
        </Text>
        <View style={common.row}>
          <IconButton onPress={() => {}} name="wallet" />
          <View style={{ width: 6, height: 1 }} />
          <IconButton onPress={() => {}} name="login" />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default ProfileScreen;
