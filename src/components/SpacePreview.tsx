import React from "react";
import { View, StyleSheet, Text } from "react-native";
import get from "lodash/get";
import { Space } from "../types/explore";
import Token from "./Token";
import colors from "../constants/colors";

const styles = StyleSheet.create({
  spacePreviewContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: "center",
  },
  spacePreviewTitleContainer: {
    marginLeft: 10,
  },
  spacePreviewTitle: {
    color: colors.black,
    fontSize: 28,
    fontFamily: "Calibre-Semibold",
  },
  spacePreviewFollowerCount: {
    fontSize: 20,
    fontFamily: "Calibre-Medium",
    color: colors.darkGray,
  },
});

type SpacePreviewProps = {
  space: Space | {};
};

function SpacePreview({ space = {} }: SpacePreviewProps) {
  return (
    <View style={styles.spacePreviewContainer}>
      <Token space={space} symbolIndex="space" size={60} />
      <View style={styles.spacePreviewTitleContainer}>
        <Text style={styles.spacePreviewTitle}>{get(space, "name")}</Text>
        <Text style={styles.spacePreviewFollowerCount}>
          {get(space, "followers")} members
        </Text>
      </View>
    </View>
  );
}

export default SpacePreview;
