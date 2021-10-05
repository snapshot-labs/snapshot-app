import React from "react";
import { Text, View } from "react-native";
import get from "lodash/get";
import Token from "../Token";
import common from "../../styles/common";
import FollowButton from "../FollowButton";
import { Space } from "../../types/explore";

type SpaceHeader = {
  space: Space;
  isWalletConnect: boolean | undefined;
};

function SpaceHeader({ space, isWalletConnect }: SpaceHeader) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <View>
          <Token space={space} symbolIndex="space" size={60} />
          <Text style={[{ marginTop: 16 }, common.headerTitle]}>
            {get(space, "name")}
          </Text>
          <Text style={[{ marginTop: 4 }, common.subTitle]}>
            {get(space, "id")}
          </Text>
        </View>
        {isWalletConnect && (
          <View style={{ marginLeft: "auto", marginTop: 20 }}>
            <FollowButton space={space} />
          </View>
        )}
      </View>
    </View>
  );
}

export default SpaceHeader;
