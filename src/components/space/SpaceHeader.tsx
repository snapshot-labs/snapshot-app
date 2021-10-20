import React from "react";
import { Text, View } from "react-native";
import i18n from "i18n-js";
import { TouchableOpacity } from "react-native-gesture-handler";
import get from "lodash/get";
import { useNavigation } from "@react-navigation/native";
import SpaceAvatar from "../SpaceAvatar";
import common from "styles/common";
import FollowButton from "../FollowButton";
import { Space } from "types/explore";
import { n } from "util/miscUtils";
import colors from "constants/colors";
import { CREATE_PROPOSAL_SCREEN } from "constants/navigation";
import IconFont from "components/IconFont";

type SpaceHeader = {
  space: Space;
  isWalletConnect: boolean | undefined;
};

function SpaceHeader({ space, isWalletConnect }: SpaceHeader) {
  const navigation: any = useNavigation();
  return (
    <View
      style={{
        paddingHorizontal: 16,
        marginTop: 24,
        backgroundColor: colors.white,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <View>
          <SpaceAvatar space={space} symbolIndex="space" size={60} />
          <Text style={[{ marginTop: 8 }, common.headerTitle]}>
            {get(space, "name")}
          </Text>
          <Text style={[{ marginTop: 4 }, common.subTitle]}>
            {get(space, "id")}
          </Text>
          <Text style={[{ marginTop: 4 }, common.subTitle]}>
            {n(get(space, "followers"))} {i18n.t("members")}
          </Text>
        </View>
        {isWalletConnect && (
          <View style={{ marginLeft: "auto", marginTop: 20 }}>
            <FollowButton space={space} />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(CREATE_PROPOSAL_SCREEN, { space });
              }}
            >
              <View style={{ marginTop: 16, alignSelf: "flex-end" }}>
                <IconFont name="plus" size={30} color={colors.black} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default SpaceHeader;
