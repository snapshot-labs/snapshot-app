import React from "react";
import { Text, View, StyleSheet, TouchableHighlight } from "react-native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import common from "styles/common";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import colors from "constants/colors";
import BackButton from "components/BackButton";
import packageJson from "../../package.json";
import IconFont from "components/IconFont";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    textAlignVertical: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  const { colors, theme } = useAuthState();
  const authDispatch = useAuthDispatch();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <BackButton title={i18n.t("settings")} />
      <View style={{ marginTop: 8, flex: 1 }}>
        <TouchableHighlight
          onPress={() => {
            authDispatch({
              type: AUTH_ACTIONS.SET_THEME,
              payload: theme === "light" ? "dark" : "light",
            });
          }}
          underlayColor={colors.highlightColor}
        >
          <View style={styles.row}>
            <IconFont
              name={theme === "light" ? "sun" : "moon"}
              size={20}
              color={colors.textColor}
            />
            <Text
              style={[
                styles.rowTitle,
                { color: colors.textColor, marginLeft: 8 },
              ]}
            >
              {i18n.t("appearance")}
            </Text>
            <Text style={styles.rowValue}>
              {theme === "light" ? i18n.t("light") : i18n.t("dark")}
            </Text>
          </View>
        </TouchableHighlight>
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
