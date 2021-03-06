import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import i18n from "i18n-js";
import IconFont from "../IconFont";
import colors from "../../constants/colors";
import Block from "../Block";
import { Strategy } from "types/explore";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  row: {
    flexDirection: "row",
    lineHeight: 24,
    marginBottom: 4,
  },
  rowTitle: {
    fontSize: 18,
    color: colors.darkGray,
    fontFamily: "Calibre-Semibold",
  },
  rowValue: {
    marginLeft: "auto",
  },
  rowValueText: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  authorText: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    color: colors.textColor,
    marginLeft: 4,
  },
});

interface BlockInformationProps {
  strategy: Strategy;
}

function BlockInformation({ strategy }: BlockInformationProps) {
  const { colors } = useAuthState();
  const authorName = strategy.author;

  return (
    <Block
      title={i18n.t("information")}
      Content={
        <View style={styles.container}>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("author")}</Text>
            <View style={styles.rowValue}>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(`https://github.com/${strategy.author}`);
                }}
              >
                <View style={styles.authorContainer}>
                  <IconFont
                    name="mark-github"
                    color={colors.textColor}
                    size={16}
                  />
                  <Text
                    style={[styles.authorText, { color: colors.textColor }]}
                  >
                    {authorName}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("version")}</Text>
            <View style={styles.rowValue}>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(
                    `https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/${strategy.key}`
                  );
                }}
              >
                <View style={styles.authorContainer}>
                  <Text
                    style={[styles.rowValueText, { color: colors.textColor }]}
                  >
                    {strategy.version}
                  </Text>
                  <IconFont
                    name="external-link"
                    style={{ marginLeft: 8 }}
                    size={20}
                    color={colors.darkGray}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}

export default BlockInformation;
