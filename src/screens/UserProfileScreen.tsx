import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import { shorten } from "helpers/miscUtils";
import { ethers } from "ethers";
import i18n from "i18n-js";
import colors from "constants/colors";
import { useToastShowConfig } from "constants/toast";
import Toast from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";
import BackButton from "components/BackButton";
import {
  FOLLOWS_QUERY,
  PROPOSALS_QUERY,
  USER_VOTES_QUERY,
} from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import get from "lodash/get";
import VotedOnProposalPreview from "components/user/VotedOnProposalPreview";
import ProposalPreview from "components/ProposalPreview";
import { useExploreState } from "context/exploreContext";
import isEmpty from "lodash/isEmpty";
import UserSpacePreview from "components/user/UserSpacePreview";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import UserAvatar from "components/UserAvatar";
import Device from "helpers/device";

const styles = StyleSheet.create({
  address: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
    textAlign: "center",
  },
  indicatorStyle: {
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
    backgroundColor: colors.darkGray,
    height: 5,
    top: 42,
  },
});

async function getVotedProposals(address: string, setProposals: any) {
  const query = {
    query: USER_VOTES_QUERY,
    variables: {
      voter: address,
    },
  };

  const result = await apolloClient.query(query);
  const proposalVotes = get(result, "data.votes", []);

  setProposals(proposalVotes);
}

async function getAuthoredProposals(
  address: string,
  setAuthoredProposals: any
) {
  try {
    const query = {
      query: PROPOSALS_QUERY,
      variables: {
        first: 100,
        skip: 0,
        author_in: [address],
        space_in: [],
        state: "all",
      },
    };

    const result = await apolloClient.query(query);
    const proposals = get(result, "data.proposals", []);
    setAuthoredProposals(proposals);
  } catch (e) {}
}

async function getProposals(
  address: string,
  setProposals: any,
  setAuthoredProposals: any,
  setLoading: (loading: boolean) => void
) {
  setLoading(true);
  await getVotedProposals(address, setProposals);
  await getAuthoredProposals(address, setAuthoredProposals);
  setLoading(false);
}

async function getFollows(address: string, setFollowedSpaces: any) {
  try {
    const query = {
      query: FOLLOWS_QUERY,
      variables: {
        follower_in: address,
      },
    };
    const result = await apolloClient.query(query);
    const followedSpaces = get(result, "data.follows", []);
    setFollowedSpaces(followedSpaces);
  } catch (e) {}
}

interface UserProfileScreenProps {
  route: {
    params: {
      address: string;
    };
  };
}

function UserProfileScreen({ route }: UserProfileScreenProps) {
  const { address } = route.params;
  const { colors } = useAuthState();
  const { spaces, profiles } = useExploreState();
  const [checksumAddress, setChecksumAddress] = useState(address);
  const toastShowConfig = useToastShowConfig();
  const [proposals, setProposals] = useState([]);
  const [authoredProposals, setAuthoredProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const userProfile = profiles[address];
  const username = get(userProfile, "ens", undefined);
  const [joinedSpaces, setJoinedSpaces] = useState([]);
  const shortenedAddress = shorten(checksumAddress ?? "");
  const userTitle = isEmpty(username)
    ? shortenedAddress
    : `${username}\n${shortenedAddress}`;

  function copyToClipboard() {
    Clipboard.setString(checksumAddress);
    Toast.show({
      type: "default",
      text1: i18n.t("publicAddressCopiedToClipboard"),
      ...toastShowConfig,
    });
  }

  useEffect(() => {
    try {
      const checksumAddress = ethers.utils.getAddress(address ?? "");
      setChecksumAddress(checksumAddress);
    } catch (e) {}
  }, [address]);

  useEffect(() => {
    getProposals(address, setProposals, setAuthoredProposals, setLoading);
    getFollows(address, setJoinedSpaces);
  }, []);

  return (
    <>
      {Device.isIos() && (
        <View
          style={{
            width: "100%",
            height: 50, // For all devices, even X, XS Max
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: colors.bgDefault,
            zIndex: 200,
          }}
        />
      )}
      <SafeAreaView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        <View
          style={[
            common.headerContainer,
            {
              borderBottomColor: colors.borderColor,
              zIndex: 200,
              backgroundColor: colors.bgDefault,
            },
          ]}
        >
          <BackButton />
          <Animated.Text
            style={{
              fontSize: 18,
              fontFamily: "Calibre-Semibold",
              color: colors.textColor,
            }}
          >
            {userTitle}
          </Animated.Text>
        </View>
        <Tabs.Container
          headerContainerStyle={{
            shadowOpacity: 0,
            shadowOffset: {
              width: 0,
              height: 0,
            },
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
            elevation: 0,
          }}
          headerListener={(val) => {
            console.log({ val });
          }}
          renderHeader={() => (
            <View
              style={[
                {
                  backgroundColor: colors.bgDefault,
                  zIndex: -1,
                },
              ]}
            >
              <View
                style={[
                  {
                    backgroundColor: colors.bgDefault,
                    alignItems: "center",
                    marginTop: 24,
                    marginBottom: 24,
                  },
                ]}
              >
                <UserAvatar address={address} size={60} />
                {!isEmpty(username) && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.address, { color: colors.textColor }]}>
                      {username}
                    </Text>
                  </View>
                )}
                <TouchableOpacity onPress={copyToClipboard}>
                  <View style={{ marginTop: 8 }}>
                    <Text
                      style={[styles.address, { color: colors.textColor }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {shorten(checksumAddress ?? "")}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
          headerHeight={130}
          renderTabBar={(props) => {
            return (
              <MaterialTabBar
                {...props}
                contentContainerStyle={{ backgroundColor: colors.bgDefault }}
                tabStyle={{ backgroundColor: colors.bgDefault }}
                labelStyle={{
                  fontFamily: "Calibre-Medium",
                  color: colors.textColor,
                  textTransform: "none",
                  fontSize: 18,
                }}
                indicatorStyle={{
                  backgroundColor: colors.indicatorColor,
                  height: 3,
                  borderBottomWidth: 0,
                }}
                inactiveColor={colors.darkGray}
                activeColor={colors.textColor}
                getLabelText={(name: any) => {
                  return i18n.t(name);
                }}
              >
                {props.children}
              </MaterialTabBar>
            );
          }}
        >
          <Tabs.Tab name="proposals">
            <Tabs.FlatList
              data={authoredProposals}
              renderItem={(data: any) => {
                return (
                  <ProposalPreview
                    proposal={data.item}
                    space={spaces[data.item?.space?.id]}
                  />
                );
              }}
              ListEmptyComponent={
                loading ? (
                  <View />
                ) : (
                  <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
                    <Text
                      style={[common.subTitle, { color: colors.textColor }]}
                    >
                      {i18n.t("noProposalsCreated")}
                    </Text>
                  </View>
                )
              }
              ListFooterComponent={
                loading ? (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      marginTop: 24,
                      padding: 24,
                      height: 150,
                    }}
                  >
                    <ActivityIndicator color={colors.textColor} size="large" />
                  </View>
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: 400,
                      backgroundColor: colors.bgDefault,
                    }}
                  />
                )
              }
            />
          </Tabs.Tab>
          <Tabs.Tab name="voted">
            <Tabs.FlatList
              data={proposals}
              renderItem={(data: any) => {
                return (
                  <VotedOnProposalPreview
                    proposal={data.item?.proposal}
                    space={data.item?.proposal?.space}
                    voter={data.item}
                  />
                );
              }}
              ListEmptyComponent={
                loading ? (
                  <View />
                ) : (
                  <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
                    <Text
                      style={[common.subTitle, { color: colors.textColor }]}
                    >
                      {i18n.t("userHasNotVotedOnAnyProposal")}
                    </Text>
                  </View>
                )
              }
              ListFooterComponent={
                loading ? (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      marginTop: 24,
                      padding: 24,
                      height: 150,
                    }}
                  >
                    <ActivityIndicator color={colors.textColor} size="large" />
                  </View>
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: 400,
                      backgroundColor: colors.bgDefault,
                    }}
                  />
                )
              }
            />
          </Tabs.Tab>
          <Tabs.Tab name="joinedSpaces">
            <Tabs.FlatList
              data={joinedSpaces}
              renderItem={(data: any) => {
                return (
                  <UserSpacePreview
                    space={data.item?.space}
                    address={address}
                  />
                );
              }}
              ListEmptyComponent={
                loading ? (
                  <View />
                ) : (
                  <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
                    <Text
                      style={[common.subTitle, { color: colors.textColor }]}
                    >
                      {i18n.t("noSpacesJoined")}
                    </Text>
                  </View>
                )
              }
            />
          </Tabs.Tab>
        </Tabs.Container>
      </SafeAreaView>
    </>
  );
}

export default UserProfileScreen;
