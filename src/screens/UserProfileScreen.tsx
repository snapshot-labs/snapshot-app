import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import StickyParallaxHeader from "react-native-sticky-parallax-header";
import UserSpacePreview from "components/user/UserSpacePreview";

const { event, ValueXY } = Animated;
const scrollY = new ValueXY();

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
  labelStyle: {
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
    textTransform: "none",
    fontSize: 18,
    marginTop: 0,
  },
  tabsWrapper: {
    paddingVertical: 0,
  },
  tabTextContainerStyle: {
    backgroundColor: colors.transparent,
    borderRadius: 30,
    paddingVertical: 0,
  },
  tabTextContainerActiveStyle: {
    backgroundColor: "transparent",
    paddingVertical: 0,
  },
  tabText: {
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
  },
  homeScreenHeader: {
    backgroundColor: colors.bgDefault,
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

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

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
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <StickyParallaxHeader
        bounces={false}
        messageContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          paddingTop: 8,
          paddingBottom: 0,
        }}
        foregroundStyles={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
        logoImageStyle={{ borderRadius: 37 }}
        headerType="TabbedHeader"
        header={() => {
          const opacity = scrollY.y.interpolate({
            inputRange: [0, 60, 90],
            outputRange: [0, 0, 1],
            extrapolate: "clamp",
          });
          const shortenedAddress = shorten(checksumAddress ?? "");
          const userTitle = isEmpty(username)
            ? shortenedAddress
            : `${username} (${shortenedAddress})`;

          return (
            <View
              style={[
                common.headerContainer,
                { borderBottomColor: colors.borderColor },
              ]}
            >
              <BackButton />
              <Animated.Text
                style={{
                  opacity,
                  fontSize: 18,
                  fontFamily: "Calibre-Semibold",
                  color: colors.textColor,
                }}
              >
                {userTitle}
              </Animated.Text>
            </View>
          );
        }}
        headerHeight={50}
        foregroundImage={{
          uri: `https://stamp.fyi/avatar/eth:${address}?s=60`,
        }}
        scrollEvent={event(
          [{ nativeEvent: { contentOffset: { y: scrollY.y } } }],
          { useNativeDriver: false }
        )}
        title={
          <TouchableOpacity onPress={copyToClipboard}>
            <Text style={[styles.address, { color: colors.textColor }]}>
              {userTitle}
            </Text>
          </TouchableOpacity>
        }
        tabs={[
          {
            title: i18n.t("proposals"),
            content: (
              <AnimatedFlatList
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
                      <ActivityIndicator
                        color={colors.textColor}
                        size="large"
                      />
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
            ),
          },
          {
            title: i18n.t("voted"),
            content: (
              <AnimatedFlatList
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
                      <ActivityIndicator
                        color={colors.textColor}
                        size="large"
                      />
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
            ),
          },
          {
            title: i18n.t("joinedSpaces"),
            content: (
              <FlatList
                data={joinedSpaces}
                renderItem={(data: any) => {
                  const defaultProposal = {
                    snapshot: "latest",
                    strategies: [],
                  };
                  const spaceDetails = spaces[data.item?.space?.id];
                  const proposalSnap = proposals.find((proposal: any) => {
                    return (
                      proposal?.proposal?.space?.id === data.item?.space.id
                    );
                  });
                  const authoredProposalsSnap = authoredProposals.find(
                    (proposal: any) => {
                      return proposal?.space?.id === data.item?.space.id;
                    }
                  );

                  const proposal = proposalSnap
                    ? get(proposalSnap, "proposal", defaultProposal)
                    : authoredProposalsSnap
                    ? authoredProposalsSnap
                    : defaultProposal;

                  if (spaceDetails) {
                    return (
                      <UserSpacePreview
                        space={spaceDetails}
                        address={address}
                        proposal={proposal}
                      />
                    );
                  }

                  return null;
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
            ),
          },
        ]}
        tabWrapperStyle={{ paddingVertical: 6 }}
        parallaxHeight={150}
        tabTextStyle={{
          fontSize: 20,
          lineHeight: 20,
          paddingHorizontal: 12,
          paddingVertical: 0,
          color: colors.darkGray,
          fontFamily: "Calibre-Medium",
        }}
        tabTextActiveStyle={{
          fontSize: 20,
          lineHeight: 20,
          paddingHorizontal: 12,
          paddingVertical: 0,
          color: colors.textColor,
          fontFamily: "Calibre-Medium",
        }}
        tabTextContainerStyle={styles.tabTextContainerStyle}
        tabTextContainerActiveStyle={styles.tabTextContainerActiveStyle}
        tabsContainerBackgroundColor={colors.bgDefault}
        tabsWrapperStyle={styles.tabsWrapper}
        logoContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 37.5,
        }}
        logoStyle={{
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 60,
        }}
        contentContainerStyles={{
          backgroundColor: colors.bgDefault,
        }}
        tabsContainerStyle={{ backgroundColor: colors.bgDefault }}
        backgroundColor={colors.bgDefault}
        titleStyle={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      />
    </SafeAreaView>
  );
}

export default UserProfileScreen;
