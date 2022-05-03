import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import get from "lodash/get";
import i18n from "i18n-js";
import { useNavigation } from "@react-navigation/native";
import { Space } from "types/explore";
import SpaceAvatar from "./SpaceAvatar";
import colors from "constants/colors";
import { SPACE_SCREEN } from "constants/navigation";
import { n } from "helpers/miscUtils";
import { useAuthState } from "context/authContext";
import FollowButton from "components/FollowButton";

const { width: deviceWidth } = Dimensions.get("screen");

const basePadding = 16;
const spaceAvatarWidth = 39;
const spacePreviewTitleContainerMargin = 10;
const buttonWidth = 120;
const spaceNameWidth =
  deviceWidth - spaceAvatarWidth - basePadding - buttonWidth - basePadding - 40;

const styles = StyleSheet.create({
  spacePreviewContainer: {
    flexDirection: "row",
    paddingVertical: 18,
    marginHorizontal: 14,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  spacePreviewTitleContainer: {
    marginLeft: spacePreviewTitleContainerMargin,
  },
  spacePreviewTitle: {
    color: colors.textColor,
    fontSize: 22,
    fontFamily: "Calibre-Semibold",
  },
  spacePreviewFollowerCount: {
    fontSize: 14,
    fontFamily: "Calibre-Medium",
    color: colors.secondaryGray,
    marginTop: 4,
  },
});

interface SpacePreviewProps {
  space: Space | any;
  lastItem?: boolean;
}

function SpacePreview({ space = {}, lastItem = false }: SpacePreviewProps) {
  const { colors } = useAuthState();
  const navigation: any = useNavigation();
  const hasMembers = get(space, "followers") !== undefined;

  return (
    <View
      style={[
        styles.spacePreviewContainer,
        {
          borderBottomColor: lastItem ? "transparent" : colors.borderColor,
        },
      ]}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.navigate(SPACE_SCREEN, { space });
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            borderBottomColor: colors.borderColor,
          }}
        >
          <SpaceAvatar
            space={space}
            symbolIndex="space"
            size={spaceAvatarWidth}
          />
          <View style={styles.spacePreviewTitleContainer}>
            <Text
              style={[
                styles.spacePreviewTitle,
                { color: colors.textColor, width: spaceNameWidth },
              ]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {get(space, "name")}
            </Text>
            {hasMembers ? (
              <Text style={styles.spacePreviewFollowerCount}>
                {n(get(space, "followers", 0))} {i18n.t("members")}
              </Text>
            ) : (
              <Text />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
      <View
        style={{
          marginLeft: "auto",
        }}
      >
        <FollowButton space={space} />
      </View>
    </View>
  );
}

export default SpacePreview;
