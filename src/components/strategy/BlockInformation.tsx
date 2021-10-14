import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import i18n from "i18n-js";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import colors from "../../constants/colors";
import Block from "../Block";
import { Strategy } from "../../types/explore";
import { getUsername } from "../../util/profile";
import { useExploreState } from "../../context/exploreContext";

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

type BlockInformationProps = {
  strategy: Strategy;
};

function BlockInformation({ strategy }: BlockInformationProps) {
  const { profiles } = useExploreState();
  const authorProfile = profiles[strategy.author];
  const authorName = getUsername(strategy.author, authorProfile);
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
                  <FontAwesome5Icon
                    name="github"
                    color={colors.textColor}
                    size={16}
                  />
                  <Text style={styles.authorText}>{authorName}</Text>
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
                  <Text style={styles.rowValueText}>{strategy.version}</Text>
                  <FontAwesome5Icon
                    name="external-link-alt"
                    style={{ marginLeft: 8 }}
                    size={12}
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
