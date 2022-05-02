import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import i18n from "i18n-js";
import BackButton from "components/BackButton";
import {
  FOLLOWS_QUERY,
  PROPOSALS_QUERY,
  USER_VOTES_QUERY,
} from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import get from "lodash/get";
import VotedOnProposalPreview from "components/user/VotedOnProposalPreview";
import { Proposal } from "types/proposal";
import uniqBy from "lodash/uniqBy";
import UserAddressHeader from "components/user/UserAddressHeader";
import IPhoneTopSafeAreaViewBackground from "components/IPhoneTopSafeAreaViewBackground";
import { useScrollManager } from "../hooks/useScrollManager";
import TabView, { TabRoute } from "components/tabBar/TabView";
import Scene from "components/tabBar/Scene";
import Device from "helpers/device";
import AnimatedHeader from "components/tabBar/AnimatedHeader";
import AnimatedTabBar from "components/tabBar/AnimatedTabBar";
import TabBarComponent from "components/tabBar/TabBar";
import AnimatedNavBar from "components/tabBar/AnimatedNavBar";
import { shorten } from "helpers/miscUtils";
import { getUserProfile } from "helpers/profile";
import {
  EXPLORE_ACTIONS,
  useExploreDispatch,
  useExploreState,
} from "context/exploreContext";
import isEmpty from "lodash/isEmpty";
import JoinedSpacesScrollView from "components/timeline/JoinedSpacesScrollView";
import UserAbout from "components/user/UserAbout";
import { getSnapshotProfileAbout, getSnapshotUser } from "helpers/address";

const headerHeight = Device.isIos() ? 300 : 260;

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

async function getProposals(
  address: string,
  setProposals: any,
  setLoading: (loading: boolean) => void
) {
  setLoading(true);
  await getVotedProposals(address, setProposals);
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
  const [proposals, setProposals] = useState([]);
  const { profiles, snapshotUsers } = useExploreState();
  const [loading, setLoading] = useState(false);
  const [joinedSpaces, setJoinedSpaces] = useState([]);
  const tabs = [
    { key: "about", title: i18n.t("about") },
    { key: "activity", title: i18n.t("activity") },
  ];
  const exploreDispatch = useExploreDispatch();
  const { scrollY, index, setIndex, getRefForKey, ...sceneProps } =
    useScrollManager(tabs, { header: headerHeight });
  const profile = getUserProfile(address, profiles);
  const ens = get(profile, "ens", undefined);
  const about = getSnapshotProfileAbout(address, snapshotUsers);

  useEffect(() => {
    getSnapshotUser(address).then((user) => {
      if (user) {
        exploreDispatch({
          type: EXPLORE_ACTIONS.SET_SNAPSHOT_USERS,
          payload: {
            [address.toLowerCase()]: user,
          },
        });
      }
    });
  }, [address]);

  useEffect(() => {
    getProposals(address, setProposals, setLoading);
    getFollows(address, setJoinedSpaces);
  }, []);

  const renderScene = useCallback(
    ({ route: tab }: { route: TabRoute }) => {
      if (tab.key === "about") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            data={
              joinedSpaces.length > 0 || about ? [{ key: "joinedSpaces" }] : []
            }
            renderItem={() => {
              return (
                <View>
                  <JoinedSpacesScrollView followedSpaces={joinedSpaces} />
                  <UserAbout about={about} />
                </View>
              );
            }}
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
                  <ActivityIndicator color={colors.textColor} size="small" />
                </View>
              ) : (
                <View style={{ width: 100, height: 100 }} />
              )
            }
            ListEmptyComponent={
              loading ? (
                <View />
              ) : (
                <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
                  {joinedSpaces.length === 0 && (
                    <Text
                      style={[common.subTitle, { color: colors.textColor }]}
                    >
                      {i18n.t("noSpacesJoined")}
                    </Text>
                  )}
                </View>
              )
            }
            {...sceneProps}
          />
        );
      } else if (tab.key === "activity") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
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
                  <Text style={[common.subTitle, { color: colors.textColor }]}>
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
                  <ActivityIndicator color={colors.textColor} size="small" />
                </View>
              ) : (
                <View style={{ width: 100, height: 100 }} />
              )
            }
            {...sceneProps}
          />
        );
      }
    },
    [getRefForKey, index, tabs, scrollY, joinedSpaces]
  );

  return (
    <>
      <IPhoneTopSafeAreaViewBackground />
      <SafeAreaView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        <View
          style={[
            common.headerContainer,
            {
              borderBottomColor: "transparent",
              zIndex: 200,
              backgroundColor: colors.bgDefault,
            },
          ]}
        >
          <BackButton />
          <AnimatedNavBar scrollY={scrollY} headerHeight={headerHeight}>
            <Text
              style={{
                color: colors.textColor,
                fontFamily: "Calibre-Medium",
                fontSize: 24,
              }}
            >
              {isEmpty(ens) ? shorten(address) : ens}
            </Text>
          </AnimatedNavBar>
        </View>
        <AnimatedHeader scrollY={scrollY} headerHeight={headerHeight}>
          <View
            style={[
              {
                backgroundColor: colors.bgDefault,
                paddingTop: Device.isIos() ? 60 : 0,
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
              <UserAddressHeader address={address} />
            </View>
          </View>
        </AnimatedHeader>
        <TabView
          index={index}
          setIndex={setIndex}
          width={Device.getDeviceWidth()}
          routes={tabs}
          renderTabBar={(p) => (
            <AnimatedTabBar scrollY={scrollY} headerHeight={headerHeight}>
              <TabBarComponent {...p} tabsLength={tabs.length} />
            </AnimatedTabBar>
          )}
          renderScene={renderScene}
        />
      </SafeAreaView>
    </>
  );
}

export default UserProfileScreen;
