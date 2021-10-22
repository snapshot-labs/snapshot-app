import React from "react";
import { Text, View, Platform } from "react-native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import BackButton from "components/BackButton";
import IconFont from "components/IconFont";
import { hubUrl } from "helpers/snapshotClient";
import styles from "styles/settings";

function AdvancedSettingsScreen() {
  const { colors } = useAuthState();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <BackButton title={i18n.t("advanced")} />
      <View style={{ marginTop: 8, flex: 1 }}>
        <View style={styles.row}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.settingsIconBgColor },
            ]}
          >
            <IconFont name={"snapshot"} size={20} color={colors.textColor} />
          </View>
          <Text
            style={[
              styles.rowTitle,
              { color: colors.textColor, marginLeft: 8 },
            ]}
          >
            {i18n.t("snapshotHub")}
          </Text>
          <Text style={styles.rowValue}>{hubUrl}</Text>
        </View>
      </View>
    </View>
  );
}

export default AdvancedSettingsScreen;
