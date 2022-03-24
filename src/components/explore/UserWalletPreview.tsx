import React, { useEffect, useState } from "react";
import { WALLET_FOLLOWERS } from "helpers/queries";
import devApolloClient from "helpers/devApolloClient";
import get from "lodash/get";
import { Text, TouchableOpacity, View } from "react-native";
import { USER_PROFILE } from "constants/navigation";
import UserAvatar from "components/UserAvatar";
import { shorten } from "helpers/miscUtils";
import { useAuthState } from "context/authContext";
import { useNavigation } from "@react-navigation/native";
import FollowUserButton from "components/user/FollowUserButton";
import i18n from "i18n-js";
import { useExploreState } from "context/exploreContext";

async function getWalletFollowers(
  address: string,
  setWalletFollowers: (walletFollowers: []) => void
) {
  const query = {
    query: WALLET_FOLLOWERS,
    variables: {
      wallet: address,
    },
  };

  const result = await devApolloClient.query(query);
  setWalletFollowers(get(result, "data.walletFollows", []));
}

interface UserWalletPreview {
  userData: any;
}

function UserWalletPreview({ userData }: UserWalletPreview) {
  const [walletFollowers, setWalletFollowers] = useState([]);
  const { colors, connectedAddress } = useAuthState();
  const navigation: any = useNavigation();
  const hideFollowButton =
    connectedAddress?.toLowerCase() !== userData.wallet.toLowerCase();
  const { profiles } = useExploreState();

  useEffect(() => {
    getWalletFollowers(userData.wallet, setWalletFollowers);
  });
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.push(USER_PROFILE, {
          address: userData.wallet,
        });
      }}
    >
      <View
        style={{
          padding: 16,
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.borderColor,
          borderRadius: 16,
        }}
      >
        <UserAvatar address={userData.wallet} size={30} />
        <Text
          style={{
            fontFamily: "Calibre-Medium",
            color: colors.textColor,
            marginLeft: 8,
            fontSize: 18,
            marginTop: 16,
          }}
        >
          {shorten(userData.wallet)}
        </Text>
        <Text
          style={{
            fontFamily: "Calibre-Medium",
            fontSize: 18,
            marginTop: 8,
            marginBottom: 8,
          }}
        >
          {walletFollowers.length} {i18n.t("followers")}
        </Text>
        {hideFollowButton && (
          <FollowUserButton
            followAddress={userData.wallet}
            walletFollowers={walletFollowers}
            getFollowers={() => {
              getWalletFollowers(userData.wallet, setWalletFollowers);
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default UserWalletPreview;
