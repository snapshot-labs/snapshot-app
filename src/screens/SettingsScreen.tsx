import React from "react";
import { Text, View, TouchableHighlight } from "react-native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import common from "styles/common";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import {
  ABOUT_SCREEN,
  ACCOUNT_DETAILS_SCREEN,
  ADVANCED_SETTINGS_SCREEN,
} from "constants/navigation";
import { useNavigation } from "@react-navigation/native";
import BackButton from "components/BackButton";
import IconFont from "components/IconFont";
import styles, { ICON_SIZE } from "styles/settings";

function SettingsScreen() {
  const { colors, theme } = useAuthState();
  const authDispatch = useAuthDispatch();
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <View
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("settings")} />
      </View>
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
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.settingsIconBgColor },
              ]}
            >
              <IconFont
                name={theme === "light" ? "sun" : "moon"}
                size={ICON_SIZE}
                color={colors.textColor}
              />
            </View>
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
        <TouchableHighlight
          onPress={() => {
            navigation.navigate(ACCOUNT_DETAILS_SCREEN);
          }}
          underlayColor={colors.highlightColor}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.settingsIconBgColor },
              ]}
            >
              <IconFont name="mine" size={ICON_SIZE} color={colors.textColor} />
            </View>
            <Text
              style={[
                styles.rowTitle,
                { color: colors.textColor, marginLeft: 8 },
              ]}
            >
              {i18n.t("accountDetails")}
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => {
            navigation.navigate(ADVANCED_SETTINGS_SCREEN);
          }}
          underlayColor={colors.highlightColor}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.settingsIconBgColor },
              ]}
            >
              <IconFont
                name={"stealth_fill"}
                size={ICON_SIZE}
                color={colors.textColor}
              />
            </View>
            <Text
              style={[
                styles.rowTitle,
                { color: colors.textColor, marginLeft: 8 },
              ]}
            >
              {i18n.t("advanced")}
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => {
            navigation.navigate(ABOUT_SCREEN);
          }}
          underlayColor={colors.highlightColor}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.settingsIconBgColor },
              ]}
            >
              <IconFont
                name={"info"}
                size={ICON_SIZE}
                color={colors.textColor}
              />
            </View>
            <Text
              style={[
                styles.rowTitle,
                { color: colors.textColor, marginLeft: 8 },
              ]}
            >
              {i18n.t("about")}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
}

export default SettingsScreen;
