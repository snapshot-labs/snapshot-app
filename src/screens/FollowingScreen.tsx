import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useAuthState } from "context/authContext";
import { WALLET_FOLLOWS } from "helpers/queries";
import devApolloClient from "helpers/devApolloClient";
import get from "lodash/get";
import common from "styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAvatar from "components/UserAvatar";
import { shorten } from "helpers/miscUtils";
import BackButton from "components/BackButton";
import i18n from "i18n-js";
import { USER_PROFILE } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";

async function getWalletFollows(
  address: string,
  setWalletFollows: (walletFollows: []) => void
) {
  try {
    const query = {
      query: WALLET_FOLLOWS,
      variables: {
        follower: address,
      },
    };
    const result = await devApolloClient.query(query);
    setWalletFollows(get(result, "data.walletFollows", []));
  } catch (e) {}
}

interface FollowingScreenProps {
  route: {
    params: {
      address: string;
    };
  };
}

function FollowingScreen({ route }: FollowingScreenProps) {
  const { address } = route.params;
  const { colors } = useAuthState();
  const [walletFollows, setWalletFollows] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    getWalletFollows(address, setWalletFollows);
  }, []);

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          common.justifySpaceBetween,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton
          title={i18n.t("addressFollowing", { address: shorten(address) })}
        />
      </View>
      <ScrollView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        {walletFollows.map((follow, i) => {
          return (
            <TouchableOpacity
              onPress={() => {
                navigation.push(USER_PROFILE, {
                  address: follow.wallet,
                });
              }}
            >
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  padding: 16,
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderColor,
                }}
              >
                <UserAvatar address={follow.wallet} size={24} />
                <Text
                  style={{
                    fontFamily: "Calibre-Medium",
                    color: colors.textColor,
                    marginLeft: 8,
                    fontSize: 18,
                  }}
                >
                  {shorten(follow.wallet)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

export default FollowingScreen;
