import React, { useEffect, useState } from "react";
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
import SpaceAvatar from "../SpaceAvatar";
import colors from "constants/colors";
import { SPACE_SCREEN } from "constants/navigation";
import { n } from "helpers/miscUtils";
import { useAuthState } from "context/authContext";
import FollowButton from "components/FollowButton";
import { getPower } from "helpers/snapshot";

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

async function getVotingPower(
  space: Space,
  address: string,
  setVotingPower: any
) {
  try {
    const response = await getPower(space, address, {
      snapshot: "latest",
      strategies: space.strategies,
    });
    if (typeof response.totalScore === "number") {
      setVotingPower(response.totalScore);
    }
  } catch (e) {
    console.log(e);
  }
}

interface UserSpacePreviewProps {
  space: Space | any;
  address: string;
}

function UserSpacePreview({ space = {}, address }: UserSpacePreviewProps) {
  const { colors } = useAuthState();
  const navigation: any = useNavigation();
  const [showUnderlay, setShowUnderlay] = useState(false);
  const [votingPower, setVotingPower] = useState(0);

  useEffect(() => {
    getVotingPower(space, address, setVotingPower);
  }, []);

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
            <Text style={styles.spacePreviewFollowerCount}>
              {i18n.t("votingPower")}
            </Text>
            <Text style={styles.spacePreviewFollowerCount}>
              {n(votingPower)} {space.symbol}
            </Text>
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

export default UserSpacePreview;
