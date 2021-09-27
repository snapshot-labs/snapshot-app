import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import get from "lodash/get";
import i18n from "i18n-js";
import { useNavigation } from "@react-navigation/native";
import { Space } from "../types/explore";
import Token from "./Token";
import colors from "../constants/colors";
import { TOKEN_SCREEN } from "../constants/navigation";

const styles = StyleSheet.create({
  spacePreviewContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
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
  const navigation: any = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(TOKEN_SCREEN, { space });
      }}
    >
      <View style={styles.spacePreviewContainer}>
        <Token space={space} symbolIndex="space" size={60} />
        <View style={styles.spacePreviewTitleContainer}>
          <Text style={styles.spacePreviewTitle}>{get(space, "name")}</Text>
          <Text style={styles.spacePreviewFollowerCount}>
            {get(space, "followers")} {i18n.t("members")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default SpacePreview;
