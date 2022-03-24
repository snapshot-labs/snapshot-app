import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import i18n from "i18n-js";
import FollowUserButton from "components/user/FollowUserButton";
import { useAuthState } from "context/authContext";
import { WALLET_FOLLOWERS, WALLET_FOLLOWS } from "helpers/queries";
import devApolloClient from "helpers/devApolloClient";
import get from "lodash/get";
import { useNavigation } from "@react-navigation/native";
import { FOLLOWERS_SCREEN, FOLLOWING_SCREEN } from "constants/navigation";

const styles = StyleSheet.create({
  followSectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    marginTop: 16,
  },
  followersContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
  },
  label: {
    fontFamily: "Calibre-Medium",
    textTransform: "uppercase",
    marginTop: 4,
  },
  value: {
    fontFamily: "Calibre-Semibold",
  },
  followingContainer: {
    paddingHorizontal: 8,
    marginVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
  },
  proposalContainer: {
    paddingHorizontal: 8,
    paddingRight: 16,
    marginVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});

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

interface FollowSection {
  followAddress: string;
  authoredProposalsCount: number;
}

function FollowSection({
  followAddress,
  authoredProposalsCount,
}: FollowSection) {
  const { colors, connectedAddress, theme } = useAuthState();
  const [walletFollows, setWalletFollows] = useState([]);
  const [walletFollowers, setWalletFollowers] = useState([]);
  const hideFollowButton =
    connectedAddress?.toLowerCase() !== followAddress.toLowerCase();
  const navigation = useNavigation();

  useEffect(() => {
    getWalletFollows(followAddress, setWalletFollows);
    getWalletFollowers(followAddress, setWalletFollowers);
  }, []);

  return (
    <View>
      <View
        style={[
          styles.followSectionContainer,
          { backgroundColor: theme === "light" ? colors.white : "#181C25" },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(FOLLOWERS_SCREEN, { address: followAddress });
          }}
        >
          <View
            style={[
              styles.followersContainer,
              { borderRightColor: colors.borderColor },
            ]}
          >
            <Text
              style={[
                styles.value,
                {
                  color: colors.textColor,
                },
              ]}
            >
              {walletFollowers.length}
            </Text>
            <Text style={[styles.label, { color: colors.textColor }]}>
              {i18n.t("followers")}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(FOLLOWING_SCREEN, { address: followAddress });
          }}
        >
          <View
            style={[
              styles.followingContainer,
              {
                borderRightColor: colors.borderColor,
              },
            ]}
          >
            <Text
              style={[
                styles.value,
                {
                  color: colors.textColor,
                },
              ]}
            >
              {walletFollows.length}
            </Text>
            <Text style={[styles.label, { color: colors.textColor }]}>
              {i18n.t("following")}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.proposalContainer}>
          <Text
            style={[
              styles.value,
              {
                color: colors.textColor,
              },
            ]}
          >
            {authoredProposalsCount}
          </Text>
          <Text style={[styles.label, { color: colors.textColor }]}>
            {i18n.t("proposal")}
          </Text>
        </View>
      </View>
      <View
        style={{
          marginTop: 16,
          alignSelf: "flex-start",
        }}
      >
        {hideFollowButton && (
          <FollowUserButton
            followAddress={followAddress}
            walletFollowers={walletFollowers}
            getFollowers={() => {
              getWalletFollowers(followAddress, setWalletFollowers);
            }}
          />
        )}
      </View>
    </View>
  );
}

export default FollowSection;
