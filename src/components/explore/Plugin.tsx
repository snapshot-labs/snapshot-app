import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import i18n from "i18n-js";
import colors from "../../constants/colors";
import { n } from "../../helpers/miscUtils";
import common from "../../styles/common";
import IconFont from "../IconFont";
import { useAuthState } from "context/authContext";

const isIOS = Platform.OS === "ios";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryText: {
    fontFamily: "Calibre-Medium",
    color: colors.darkGray,
    fontSize: 18,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
    marginTop: 6,
  },
  authorText: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    color: colors.darkGray,
    marginLeft: 4,
  },
});

function getLogoUrl(key: string) {
  return `https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/${key}/logo.png`;
}

type PluginProps = {
  plugin: any;
};

function Plugin({ plugin }: PluginProps) {
  const { colors } = useAuthState();
  return (
    <View style={[styles.container, { borderBottomColor: colors.borderColor }]}>
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(
            `https://github.com/snapshot-labs/snapshot-plugins/tree/master/src/plugins/${plugin.key}`
          );
        }}
      >
        <View style={styles.titleContainer}>
          <Image
            source={{ uri: getLogoUrl(plugin.key) }}
            style={{ width: 24, height: 24, borderRadius: 12, marginRight: 4 }}
          />
          <Text
            style={[
              common.h4,
              { marginTop: isIOS ? 4 : 0, color: colors.textColor },
            ]}
          >
            {plugin.name}
          </Text>
          <Text
            style={[
              styles.secondaryText,
              { marginLeft: 4, marginTop: isIOS ? 4 : 0 },
            ]}
          >
            {plugin.version}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          Linking.openURL(`https://github.com/${plugin.author}`);
        }}
      >
        <View style={styles.authorContainer}>
          <IconFont name="mark-github" color={colors.darkGray} size={16} />
          <Text style={styles.authorText}>{plugin.author}</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.secondaryText}>
        {i18n.t("inSpaces", { spaceCount: n(plugin.spaces) })}
      </Text>
    </View>
  );
}

export default Plugin;
