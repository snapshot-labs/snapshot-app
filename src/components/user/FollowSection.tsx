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
import { ethers } from "ethers";

const styles = StyleSheet.create({
  followSectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    marginTop: 12,
  },
  followersContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    marginVertical: 8,
    justifyContent: "flex-start",
  },
  label: {
    fontFamily: "Calibre-Medium",
    marginTop: 4,
  },
  value: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  followingContainer: {
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  proposalContainer: {
    paddingHorizontal: 8,
    paddingRight: 16,
    marginVertical: 4,
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
  votesCount: number;
}

function FollowSection({ followAddress, votesCount }: FollowSection) {
  const { colors, connectedAddress } = useAuthState();
  const [walletFollows, setWalletFollows] = useState([]);
  const [walletFollowers, setWalletFollowers] = useState([]);
  const hideFollowButton =
    connectedAddress?.toLowerCase() !== followAddress.toLowerCase();
  const navigation = useNavigation();

  useEffect(() => {
    try {
      const checksumAddress = ethers.utils.getAddress(followAddress ?? "");
      getWalletFollows(checksumAddress, setWalletFollows);
      getWalletFollowers(checksumAddress, setWalletFollowers);
    } catch (e) {}
  }, []);

  return (
    <View>
      <View style={styles.followSectionContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(FOLLOWERS_SCREEN, { address: followAddress });
          }}
        >
          <View style={styles.followersContainer}>
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
            <Text style={[styles.label, { color: colors.secondaryGray }]}>
              {i18n.t("followers")}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(FOLLOWING_SCREEN, { address: followAddress });
          }}
        >
          <View style={styles.followingContainer}>
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
            <Text style={[styles.label, { color: colors.secondaryGray }]}>
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
            {votesCount}
          </Text>
          <Text style={[styles.label, { color: colors.secondaryGray }]}>
            {i18n.t("votes")}
          </Text>
        </View>
      </View>
      <View
        style={{
          marginTop: 16,
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
