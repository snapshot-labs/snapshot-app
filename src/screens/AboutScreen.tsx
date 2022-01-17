import React from "react";
import { Text, View } from "react-native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import BackButton from "components/BackButton";
import packageJson from "../../package.json";
import IconFont from "components/IconFont";
import styles, { ICON_SIZE } from "styles/settings";

function AboutScreen() {
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
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("about")} />
      </View>
      <View style={{ marginTop: 8, flex: 1 }}>
        <View style={styles.row}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.settingsIconBgColor },
            ]}
          >
            <IconFont
              name={"snapshot"}
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
            {i18n.t("version")}
          </Text>
          <Text style={styles.rowValue}>{packageJson.version}</Text>
        </View>
      </View>
    </View>
  );
}

export default AboutScreen;
