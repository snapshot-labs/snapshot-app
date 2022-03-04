import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Platform,
  FlatList,
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
import { SceneMap, TabView, TabBar } from "react-native-tab-view";
import UserAvatar from "components/UserAvatar";
import { TouchableNativeFeedback } from "react-native-gesture-handler";
import TabBarItem from "components/tabBar/TabBarItem";
import FlatListFooterLoader from "components/FlatListFooterLoader";
import Device from "helpers/device";

const headerHeight = Device.isIos() ? 138 : 147;
const { width } = Dimensions.get("screen");

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
});

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

function TabCustomTouchableNativeFeedback({ children, ...props }: any) {
  return (
    <TouchableNativeFeedback
      {...props}
      background={TouchableNativeFeedback.Ripple("rgba(0, 0, 0, .32)", false)}
      style={[{ width: width / 3 }].concat(props.style)}
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
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "proposals", title: i18n.t("proposals") },
    { key: "voted", title: i18n.t("voted") },
    { key: "joinedSpaces", title: i18n.t("joinedSpaces") },
  ]);
  const scrollProposals = useRef(new Animated.Value(0));
  const headerProposals = scrollProposals.current.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });
  const opacity = scrollProposals.current.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });
  const proposalsFlatListRef: any = useRef();
  const votedFlatListRef: any = useRef();
  const joinedFlatListRef: any = useRef();
  const indexRef: any = useRef();

  useEffect(() => {
    scrollProposals.current.addListener(({ value }) => {
      if (value >= headerHeight - 100) {
        console.log({ value });
        if (indexRef.current === 0) {
          votedFlatListRef?.current?.scrollToOffset({
            offset: headerHeight,
          });
          joinedFlatListRef?.current?.scrollToOffset({
            offset: headerHeight,
          });
        } else if (indexRef.current === 1) {
          proposalsFlatListRef?.current?.scrollToOffset({
            offset: headerHeight,
          });
          joinedFlatListRef?.current?.scrollToOffset({
            offset: headerHeight,
          });
        } else if (indexRef.current === 2) {
          proposalsFlatListRef?.current?.scrollToOffset({
            offset: headerHeight,
          });
          votedFlatListRef?.current?.scrollToOffset({
            offset: headerHeight,
          });
        }
      } else if (value < 4) {
        if (indexRef.current === 0) {
          votedFlatListRef?.current?.scrollToOffset({
            offset: 0,
          });
          joinedFlatListRef?.current?.scrollToOffset({
            offset: 0,
          });
        } else if (indexRef.current === 1) {
          proposalsFlatListRef?.current?.scrollToOffset({
            offset: 0,
          });
          joinedFlatListRef?.current?.scrollToOffset({
            offset: 0,
          });
        } else if (indexRef.current === 2) {
          proposalsFlatListRef?.current?.scrollToOffset({
            offset: 0,
          });
          votedFlatListRef?.current?.scrollToOffset({
            offset: 0,
          });
        }
      }
    });
    return () => {
      scrollProposals.current.removeAllListeners();
    };
  }, []);

  const renderTabBar = (props: any) => (
    <>
      <Animated.View
        style={[
          {
            backgroundColor: colors.bgDefault,
            width: "100%",
            height: headerHeight,
            top: 0,
            left: 0,
            position: "absolute",
            zIndex: 200,
          },
          [
            {
              transform: [{ translateY: headerProposals }],
            },
          ],
        ]}
      >
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
        <TabBar
          {...props}
          labelStyle={styles.labelStyle}
          indicatorStyle={[
            styles.indicatorStyle,
            { color: colors.textColor, backgroundColor: colors.indicatorColor },
          ]}
          activeColor={colors.textColor}
          style={{
            shadowColor: "transparent",
            borderTopWidth: 0,
            shadowOpacity: 0,
            backgroundColor: colors.bgDefault,
            height: 45,
            elevation: 0,
            borderBottomColor: colors.borderColor,
            borderBottomWidth: 1,
            paddingTop: 4,
          }}
          inactiveColor={colors.textColor}
          renderTabBarItem={(item) => {
            return (
              <TabBarItem
                {...item}
                //@ts-ignore
                PressableComponent={
                  Platform.OS === "android"
                    ? TabCustomTouchableNativeFeedback
                    : undefined
                }
              />
            );
          }}
          tabStyle={{ alignItems: "center", justifyContent: "flex-start" }}
        />
      </Animated.View>
    </>
  );

  const renderScene = useMemo(
    () =>
      SceneMap({
        proposals: () => {
          return (
            <AnimatedFlatList
              scrollEventThrottle={16}
              ref={proposalsFlatListRef}
              data={authoredProposals}
              contentContainerStyle={{ marginTop: headerHeight + 32 }}
              overScrollMode={"never"}
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
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: { y: scrollProposals.current },
                    },
                  },
                ],
                {
                  useNativeDriver: true,
                }
              )}
              ListFooterComponent={<FlatListFooterLoader loading={loading} />}
            />
          );
        },
        voted: () => {
          return (
            <AnimatedFlatList
              ref={votedFlatListRef}
              data={proposals}
              contentContainerStyle={{
                marginTop: headerHeight + 32,
              }}
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
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: { y: scrollProposals.current },
                    },
                  },
                ],
                {
                  useNativeDriver: true,
                }
              )}
              ListFooterComponent={<FlatListFooterLoader loading={loading} />}
            />
          );
        },
        joinedSpaces: () => {
          return (
            <AnimatedFlatList
              ref={joinedFlatListRef}
              contentContainerStyle={{
                marginTop: headerHeight + 40,
              }}
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
              onScroll={Animated.event(
                [
                  {
                    nativeEvent: {
                      contentOffset: { y: scrollProposals.current },
                    },
                  },
                ],
                {
                  useNativeDriver: true,
                }
              )}
              ListFooterComponent={<FlatListFooterLoader loading={loading} />}
            />
          );
        },
      }),
    [proposals, authoredProposals, joinedSpaces, loading]
  );

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
              opacity,
              fontSize: 18,
              fontFamily: "Calibre-Semibold",
              color: colors.textColor,
            }}
          >
            {userTitle}
          </Animated.Text>
        </View>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={(index) => {
            indexRef.current = index;
            setIndex(index);
          }}
          initialLayout={{ width }}
          renderTabBar={renderTabBar}
        />
      </SafeAreaView>
    </>
  );
}

export default UserProfileScreen;
