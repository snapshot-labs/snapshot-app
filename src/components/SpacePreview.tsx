import React from "react";
import { View, StyleSheet, Text, TouchableHighlight } from "react-native";
import get from "lodash/get";
import i18n from "i18n-js";
import { useNavigation } from "@react-navigation/native";
import { Space } from "../types/explore";
import SpaceAvatar from "./SpaceAvatar";
import colors from "../constants/colors";
import { SPACE_SCREEN } from "../constants/navigation";
import { n } from "../util/miscUtils";

const styles = StyleSheet.create({
  spacePreviewContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  spacePreviewTitleContainer: {
    marginLeft: 10,
  },
  spacePreviewTitle: {
    color: colors.black,
    fontSize: 22,
    fontFamily: "Calibre-Semibold",
  },
  spacePreviewFollowerCount: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    color: colors.darkGray,
  },
});

type SpacePreviewProps = {
  space: Space | any;
};

function SpacePreview({ space = {} }: SpacePreviewProps) {
  const navigation: any = useNavigation();
  const hasMembers = get(space, "followers") !== undefined;
  return (
    <TouchableHighlight
      onPress={() => {
        navigation.navigate(SPACE_SCREEN, { space });
      }}
      underlayColor={colors.highlightColor}
    >
      <View style={styles.spacePreviewContainer}>
        <SpaceAvatar space={space} symbolIndex="space" size={60} />
        <View style={styles.spacePreviewTitleContainer}>
          <Text style={styles.spacePreviewTitle}>{get(space, "name")}</Text>
          {hasMembers ? (
            <Text style={styles.spacePreviewFollowerCount}>
              {n(get(space, "followers", 0))} {i18n.t("members")}
            </Text>
          ) : (
            <Text />
          )}
        </View>
      </View>
    </TouchableHighlight>
  );
}

export default SpacePreview;
