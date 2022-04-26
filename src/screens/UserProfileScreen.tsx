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
import ProposalPreview from "components/proposal/ProposalPreviewNew";
import UserSpacePreview from "components/user/UserSpacePreview";
import { Proposal } from "types/proposal";
import uniqBy from "lodash/uniqBy";
import FollowSection from "components/user/FollowSection";
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
import { useExploreState } from "context/exploreContext";
import isEmpty from "lodash/isEmpty";

const LOAD_BY = 10;
const headerHeight = Device.isIos() ? 380 : 360;
const deviceHeight = Device.getDeviceHeight();

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
  setAuthoredProposals: any,
  loadCount: number,
  proposals: Proposal[],
  setLoadCount?: (loadCount: number) => void
) {
  try {
    const query = {
      query: PROPOSALS_QUERY,
      variables: {
        first: LOAD_BY,
        skip: loadCount,
        author_in: [address],
        space_in: [],
        state: "all",
      },
    };

    const result = await apolloClient.query(query);
    const nextProposals = get(result, "data.proposals", []);

    if (loadCount === 0) {
      setAuthoredProposals(nextProposals);
    } else {
      const newProposals = uniqBy([...proposals, ...nextProposals], "id");
      setAuthoredProposals(newProposals);
      if (setLoadCount) {
        setLoadCount(loadCount + LOAD_BY);
      }
    }
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
  await getAuthoredProposals(address, setAuthoredProposals, 0, []);
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
  const [authoredProposals, setAuthoredProposals] = useState([]);
  const [authoredProposalsLoadCount, setAuthoredProposalsLoadCount] =
    useState<number>(LOAD_BY);
  const [loadingAuthoredProposals, setLoadingMoreAuthoredProposals] =
    useState<boolean>(false);
  const { profiles } = useExploreState();
  const [loading, setLoading] = useState(false);
  const [joinedSpaces, setJoinedSpaces] = useState([]);
  const tabs = [
    { key: "proposals", title: i18n.t("proposals") },
    { key: "voted", title: i18n.t("voted") },
    { key: "joinedSpaces", title: i18n.t("joinedSpaces") },
  ];
  const { scrollY, index, setIndex, getRefForKey, ...sceneProps } =
    useScrollManager(tabs, { header: headerHeight });
  const profile = getUserProfile(address, profiles);
  const ens = get(profile, "ens", undefined);

  const renderScene = useCallback(
    ({ route: tab }: { route: TabRoute }) => {
      if (tab.key === "proposals") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            data={authoredProposals}
            renderItem={(data: any) => {
              return (
                <View
                  style={[
                    common.proposalPreviewContainer,
                    {
                      borderBottomColor: colors.borderColor,
                    },
                  ]}
                >
                  <ProposalPreview proposal={data.item} />
                </View>
              );
            }}
            ListEmptyComponent={
              loading ? (
                <View />
              ) : (
                <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
                  <Text style={[common.subTitle, { color: colors.textColor }]}>
                    {i18n.t("noProposalsCreated")}
                  </Text>
                  <View style={{ width: 100, height: deviceHeight * 0.9 }} />
                </View>
              )
            }
            ListFooterComponent={
              loading || loadingAuthoredProposals ? (
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
                <View style={{ width: 100, height: deviceHeight * 0.9 }} />
              )
            }
            onEndReachedThreshold={0.6}
            onEndReached={async () => {
              setLoadingMoreAuthoredProposals(true);
              await getAuthoredProposals(
                address,
                setAuthoredProposals,
                authoredProposalsLoadCount,
                authoredProposals,
                setAuthoredProposalsLoadCount
              );
              setLoadingMoreAuthoredProposals(false);
            }}
            {...sceneProps}
          />
        );
      } else if (tab.key === "voted") {
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
                  <View style={{ width: 100, height: deviceHeight * 0.9 }} />
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
                <View style={{ width: 100, height: deviceHeight * 0.9 }} />
              )
            }
            {...sceneProps}
          />
        );
      } else if (tab.key === "joinedSpaces") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            data={joinedSpaces}
            headerHeight={headerHeight}
            renderItem={(data: any) => {
              return (
                <UserSpacePreview space={data.item?.space} address={address} />
              );
            }}
            ListEmptyComponent={
              loading ? (
                <View />
              ) : (
                <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
                  <Text style={[common.subTitle, { color: colors.textColor }]}>
                    {i18n.t("noSpacesJoined")}
                  </Text>
                  <View style={{ width: 100, height: deviceHeight * 0.9 }} />
                </View>
              )
            }
            ListFooterComponent={
              <View style={{ width: 100, height: deviceHeight * 0.9 }} />
            }
            {...sceneProps}
          />
        );
      }
    },
    [getRefForKey, index, tabs, scrollY]
  );

  useEffect(() => {
    getProposals(address, setProposals, setAuthoredProposals, setLoading);
    getFollows(address, setJoinedSpaces);
  }, []);

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
              <FollowSection
                followAddress={address}
                votesCount={proposals.length}
              />
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
              <TabBarComponent {...p} />
            </AnimatedTabBar>
          )}
          renderScene={renderScene}
        />
      </SafeAreaView>
    </>
  );
}

export default UserProfileScreen;
