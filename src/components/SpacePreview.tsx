import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
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
const spaceAvatarWidth = 60;
const spacePreviewTitleContainerMargin = 10;
const buttonWidth = 120;
const spaceNameWidth =
  deviceWidth - spaceAvatarWidth - basePadding - buttonWidth - basePadding - 16;

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
    marginLeft: spacePreviewTitleContainerMargin,
  },
  spacePreviewTitle: {
    color: colors.textColor,
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
  const { colors } = useAuthState();
  const navigation: any = useNavigation();
  const hasMembers = get(space, "followers") !== undefined;
  const [showUnderlay, setShowUnderlay] = useState(false);
  return (
    <View
      style={[
        styles.spacePreviewContainer,
        {
          borderBottomColor: colors.borderColor,
          backgroundColor: showUnderlay
            ? colors.highlightColor
            : colors.bgDefault,
        },
      ]}
    >
      <TouchableHighlight
        onPress={() => {
          navigation.navigate(SPACE_SCREEN, { space });
        }}
        onShowUnderlay={() => setShowUnderlay(true)}
        onHideUnderlay={() => setShowUnderlay(false)}
        underlayColor="transparent"
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
      </TouchableHighlight>
      <View
        style={{
          marginLeft: "auto",
          height: 60,
        }}
      >
        <FollowButton space={space} />
      </View>
    </View>
  );
}

export default SpacePreview;
