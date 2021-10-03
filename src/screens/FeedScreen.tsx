import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  Text,
  View,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uniqBy from "lodash/uniqBy";
import get from "lodash/get";
import apolloClient from "../util/apolloClient";
import { PROPOSALS_QUERY } from "../util/queries";
import ProposalPreview from "../components/ProposalPreview";
import { Proposal } from "../types/proposal";
import { useAuthState } from "../context/authContext";
import common from "../styles/common";
import i18n from "i18n-js";
import colors from "../constants/colors";
import { CollapsibleHeaderFlatList } from "react-native-collapsible-header-views";
import TimelineHeader from "../components/timeline/TimelineHeader";
import proposal from "../constants/proposal";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useExploreDispatch, useExploreState } from "../context/exploreContext";
import { setProfiles } from "../util/profile";

const LOAD_BY = 6;

async function getProposals(
  followedSpaces: any,
  loadCount: number,
  proposals: Proposal[],
  setLoadCount: (loadCount: number) => void,
  setProposals: (proposals: Proposal[]) => void,
  isInitial: boolean,
  setLoadingMore: (loadingMore: boolean) => void,
  state: string,
  useFollowedSpaces: boolean
) {
  const query = {
    query: PROPOSALS_QUERY,
    variables: {
      first: LOAD_BY,
      skip: loadCount,
      space_in: useFollowedSpaces
        ? followedSpaces.map((follow: any) => follow.space.id)
        : [],
      state,
    },
  };

  const result = await apolloClient.query(query);
  const proposalResult = get(result, "data.proposals", []);
  if (isInitial) {
    setProposals(proposalResult);
  } else {
    const newProposals = uniqBy([...proposals, ...proposalResult], "id");
    setProposals(newProposals);
    setLoadCount(loadCount + LOAD_BY);
  }
  setLoadingMore(false);
}

type FeedScreenProps = {
  useFollowedSpaces?: boolean;
};

function FeedScreen({ useFollowedSpaces = true }: FeedScreenProps) {
  const { followedSpaces } = useAuthState();
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<{ key: string; text: string }>(
    proposal.getStateFilters()[0]
  );

  useEffect(() => {
    if (followedSpaces.length > 0 || !useFollowedSpaces) {
      setLoadingMore(true);
      getProposals(
        followedSpaces,
        loadCount,
        proposals,
        setLoadCount,
        setProposals,
        true,
        setLoadingMore,
        filter.key,
        useFollowedSpaces
      );
    }
  }, [followedSpaces]);

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray = proposals.map((proposal: Proposal) => proposal.author);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    setProfiles(filteredArray, exploreDispatch);
  }, [proposals]);

  return (
    <CollapsibleHeaderFlatList
      clipHeader
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setLoadCount(0);
            setRefreshing(true);
            getProposals(
              followedSpaces,
              0,
              proposals,
              setLoadCount,
              setProposals,
              true,
              setRefreshing,
              filter.key,
              useFollowedSpaces
            );
          }}
        />
      }
      CollapsibleHeaderComponent={
        <TimelineHeader
          filter={filter}
          setFilter={setFilter}
          onChangeFilter={(newFilter: string) => {
            setLoadCount(0);
            getProposals(
              followedSpaces,
              0,
              proposals,
              setLoadCount,
              setProposals,
              true,
              setLoadingMore,
              newFilter,
              useFollowedSpaces
            );
          }}
          useFollowedSpaces={useFollowedSpaces}
        />
      }
      headerHeight={65}
      data={proposals}
      renderItem={(data) => {
        return <ProposalPreview proposal={data.item} fromFeed={true} />;
      }}
      keyExtractor={(item) => `${item.id}`}
      onEndReachedThreshold={0.6}
      onEndReached={() => {
        setLoadingMore(true);
        getProposals(
          followedSpaces,
          loadCount === 0 ? LOAD_BY : loadCount,
          proposals,
          setLoadCount,
          setProposals,
          false,
          setLoadingMore,
          filter.key,
          useFollowedSpaces
        );
      }}
      ListEmptyComponent={
        loadingMore ? (
          <View />
        ) : (
          <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
            <Text style={common.subTitle}>
              {followedSpaces.length === 0
                ? useFollowedSpaces
                  ? i18n.t("noSpacesJoinedYet")
                  : i18n.t("cantFindAnyResults")
                : i18n.t("cantFindAnyResults")}
            </Text>
          </View>
        )
      }
      ListFooterComponent={
        loadingMore ? (
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              height: 150,
            }}
          >
            <ActivityIndicator color={colors.textColor} size="large" />
          </View>
        ) : (
          <View
            style={{ width: "100%", height: 150, backgroundColor: "white" }}
          />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  indicatorStyle: {
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
    backgroundColor: colors.darkGray,
  },
  labelStyle: {
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
    textTransform: "capitalize",
    fontSize: 18,
  },
});

function AllSpacesFeedScreen() {
  return <FeedScreen useFollowedSpaces={false} />;
}

const renderScene = SceneMap({
  first: FeedScreen,
  second: AllSpacesFeedScreen,
});

function FeedScreenTabView() {
  const [index, setIndex] = React.useState(0);
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [routes] = React.useState([
    { key: "first", title: i18n.t("joinedSpaces") },
    { key: "second", title: i18n.t("allSpaces") },
  ]);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      labelStyle={styles.labelStyle}
      indicatorStyle={styles.indicatorStyle}
      activeColor={colors.textColor}
      style={{ backgroundColor: colors.white }}
      inactiveColor={colors.textColor}
    />
  );

  return (
    <View style={[common.screen, { paddingTop: insets.top }]}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}

export default FeedScreenTabView;
