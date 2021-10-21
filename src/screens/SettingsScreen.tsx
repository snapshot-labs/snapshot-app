import React from "react";
import { Text, View, StyleSheet } from "react-native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import colors from "constants/colors";
import BackButton from "components/BackButton";
import packageJson from "../../package.json";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    textAlignVertical: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    paddingHorizontal: 16,
  },
  rowTitle: {
    color: colors.textColor,
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  rowValue: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: "auto",
  },
});

function SettingsScreen() {
  const { colors } = useAuthState();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <BackButton />
      <View style={{ marginTop: 8, flex: 1 }}>
        <Text
          style={[
            common.headerTitle,
            { paddingHorizontal: 16, color: colors.textColor },
          ]}
        >
          {i18n.t("settings")}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.rowTitle, { color: colors.textColor }]}>
            {i18n.t("appearance")}
          </Text>
          <Text style={[styles.rowValue, { color: colors.textColor }]}>
            {i18n.t("light")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.rowTitle, { color: colors.textColor }]}>
            {i18n.t("version")}
          </Text>
          <Text style={styles.rowValue}>{packageJson.version}</Text>
        </View>
      </View>
    </View>
  );
}

export default SettingsScreen;
