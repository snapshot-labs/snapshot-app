import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import common from "styles/common";
import { AUTH_ACTIONS, useAuthState } from "context/authContext";
import UserAvatar from "components/UserAvatar";
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
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import ProposalPreview from "components/ProposalPreview";
import { useExploreState } from "context/exploreContext";
import TabBarItem from "components/tabBar/TabBarItem";
import isEmpty from "lodash/isEmpty";
import { TouchableNativeFeedback } from "react-native-gesture-handler";
import { headerHeight } from "screens/SpaceScreen";
import StickyParallaxHeader from "react-native-sticky-parallax-header";
import { ContextDispatch } from "types/context";
import SpacePreview from "components/SpacePreview";

const { event, ValueXY } = Animated;
const scrollY = new ValueXY();

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
  address: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
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
  },
  tabTextContainerActiveStyle: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
  },
  homeScreenHeader: {
    backgroundColor: colors.bgDefault,
  },
});

function TabCustomTouchableNativeFeedback({ children, ...props }: any) {
  return (
    <TouchableNativeFeedback
      {...props}
      background={TouchableNativeFeedback.Ripple("rgba(0, 0, 0, .32)", false)}
      style={[{ width: width / 2 }].concat(props.style)}
    >
      {children}
    </TouchableNativeFeedback>
  );
}

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
              {`${username}\n`}
              {shorten(checksumAddress ?? "")}
            </Text>
          </TouchableOpacity>
        }
        tabs={[
          {
            title: "Proposals",
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
            title: "Voted",
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
            title: "Joined Spaces",
            content: (
              <FlatList
                data={joinedSpaces}
                renderItem={(data: any) => {
                  const spaceDetails = spaces[data.item?.space?.id];
                  if (spaceDetails) {
                    return <SpacePreview space={spaceDetails} />;
                  }

                  return null;
                }}
              />
            ),
          },
          {
            title: "Voting Power",
            content: <View></View>,
          },
        ]}
        parallaxHeight={200}
        tabTextStyle={{
          fontSize: 20,
          lineHeight: 20,
          paddingHorizontal: 12,
          paddingVertical: 8,
          color: colors.darkGray,
          fontFamily: "Calibre-Medium",
        }}
        tabTextActiveStyle={{
          fontSize: 20,
          lineHeight: 20,
          paddingHorizontal: 12,
          paddingVertical: 8,
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
        titleStyle={{ justifyContent: "center", alignItems: "center" }}
      />
    </SafeAreaView>
  );
}

export default UserProfileScreen;
