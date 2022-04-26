import React from "react";
import { Text, View, StyleSheet } from "react-native";
import i18n from "i18n-js";
import get from "lodash/get";
import { useNavigation } from "@react-navigation/native";
import SpaceAvatar from "../SpaceAvatar";
import common from "styles/common";
import FollowButton from "../FollowButton";
import { Space } from "types/explore";
import { n } from "helpers/miscUtils";
import { CREATE_PROPOSAL_SCREEN } from "constants/navigation";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";
import { addressIsSnapshotWallet } from "helpers/address";
import SubscribeToSpaceButton from "components/space/SubscribeToSpaceButton";
import IconButton from "components/IconButton";
import Device from "helpers/device";

const verified: any = require("../../constants/verifiedSpaces.json");

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 2,
    paddingTop: Device.isIos() ? 80 : 30,
  },
  separator: {
    width: 6,
    height: 10,
  },
});

interface SpaceHeader {
  space: Space;
}

function SpaceHeader({ space }: SpaceHeader) {
  const { colors, connectedAddress, snapshotWallets, isWalletConnect } =
    useAuthState();
  const navigation: any = useNavigation();
  const isSnapshotWallet = addressIsSnapshotWallet(
    connectedAddress ?? "",
    snapshotWallets
  );
  const verificationStatus = verified[space?.id] || 0;
  const isVerified = verificationStatus === 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgDefault }]}>
      <SpaceAvatar space={space} symbolIndex="space" size={60} />
      <View style={[common.row, common.alignItemsCenter]}>
        <Text
          style={[
            { marginTop: 8 },
            common.headerTitle,
            { color: colors.textColor },
          ]}
        >
          {get(space, "name")}
        </Text>
        {isVerified && (
          <IconFont
            name="check-verified"
            size={22}
            color={colors.blueButtonBg}
            style={{ marginLeft: 6, marginTop: 10 }}
          />
        )}
      </View>
      <Text style={[{ marginTop: 4 }, common.subTitle]}>
        {get(space, "id")}
      </Text>
      <Text style={[{ marginTop: 4 }, common.subTitle]}>
        {n(get(space, "followers"))} {i18n.t("members")}
      </Text>
      {(isWalletConnect || isSnapshotWallet) && (
        <View style={[common.row, common.alignItemsCenter, { marginTop: 22 }]}>
          <FollowButton space={space} />
          <View style={styles.separator} />
          <SubscribeToSpaceButton space={space} />
          <View style={styles.separator} />
          <IconButton
            onPress={() => {
              navigation.navigate(CREATE_PROPOSAL_SCREEN, { space });
            }}
            name="plus"
            iconSize={22}
          />
        </View>
      )}
    </View>
  );
}

export default SpaceHeader;
