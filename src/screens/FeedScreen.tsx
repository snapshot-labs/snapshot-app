import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  View,
  useWindowDimensions,
  StyleSheet,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uniqBy from "lodash/uniqBy";
import get from "lodash/get";
import apolloClient from "helpers/apolloClient";
import { FOLLOWS_QUERY, PROPOSALS_QUERY } from "helpers/queries";
import ProposalPreview from "components/ProposalPreview";
import { Proposal } from "types/proposal";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import common from "styles/common";
import i18n from "i18n-js";
import colors from "constants/colors";
import TimelineHeader from "components/timeline/TimelineHeader";
import proposal from "constants/proposal";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import {
  EXPLORE_ACTIONS,
  useExploreDispatch,
  useExploreState,
} from "context/exploreContext";
import { setProfiles } from "helpers/profile";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { ContextDispatch } from "types/context";
import { defaultHeaders } from "helpers/apiUtils";

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

async function getFollows(
  accountId: string | null | undefined,
  authDispatch: ContextDispatch
) {
  if (accountId) {
    const query = {
      query: FOLLOWS_QUERY,
      variables: {
        follower_in: accountId,
      },
    };
    const result = await apolloClient.query(query);
    const followedSpaces = get(result, "data.follows", []);
    authDispatch({
      type: AUTH_ACTIONS.SET_FOLLOWED_SPACES,
      payload: followedSpaces,
    });
  }
}

async function getExplore(exploreDispatch: ContextDispatch) {
  try {
    const options: { [key: string]: any } = {
      method: "get",
      headers: {
        ...defaultHeaders,
      },
    };
    const response = await fetch(
      "https://hub.snapshot.org/api/explore",
      options
    );
    const explore = await response.json();
    exploreDispatch({
      type: EXPLORE_ACTIONS.SET_EXPLORE,
      payload: explore,
    });
  } catch (e) {}
}

type FeedScreenProps = {
  useFollowedSpaces?: boolean;
  feedRef: any;
  filter: { key: string; title: string };
};

function FeedScreen({
  useFollowedSpaces = true,
  feedRef,
  filter,
}: FeedScreenProps) {
  const { followedSpaces, colors } = useAuthState();
  const { profiles, spaces } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    feedRef.current = {
      onChangeFilter: (newFilter: string) => {
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
      },
    };
  }, []);

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
    <FlatList
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
      data={proposals}
      renderItem={(data) => {
        return (
          <ProposalPreview
            proposal={data.item}
            fromFeed={true}
            space={spaces[data.item?.space?.id]}
          />
        );
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
            <Text style={[common.subTitle, { color: colors.textColor }]}>
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
            style={{
              width: "100%",
              height: 150,
              backgroundColor: colors.bgDefault,
            }}
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
    height: 5,
    top: 46,
  },
  labelStyle: {
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
    textTransform: "none",
    fontSize: 18,
  },
});

const renderScene = (
  joinedSpacesRef: any,
  allSpacesRef: any,
  joinedSpacesFilter: any,
  allSpacesFilter: any
) =>
  SceneMap({
    joinedSpaces: () => (
      <FeedScreen feedRef={joinedSpacesRef} filter={joinedSpacesFilter} />
    ),
    allSpaces: () => (
      <FeedScreen
        useFollowedSpaces={false}
        feedRef={allSpacesRef}
        filter={allSpacesFilter}
      />
    ),
  });

function FeedScreenTabView() {
  const { colors, connectedAddress } = useAuthState();
  const authDispatch = useAuthDispatch();
  const exploreDispatch = useExploreDispatch();
  const [index, setIndex] = React.useState(0);
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const joinedSpacesRef: any = useRef(null);
  const allSpacesRef: any = useRef(null);
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const [routes] = React.useState([
    { key: "joinedSpaces", title: i18n.t("joinedSpaces") },
    { key: "allSpaces", title: i18n.t("allSpaces") },
  ]);
  const [joinedSpacesFilter, setJoinedSpacesFilter] = useState(
    proposal.getStateFilters()[0]
  );
  const [allSpacesFilter, setAllSpacesFilter] = useState(
    proposal.getStateFilters()[0]
  );
  const [isInitial, setIsInitial] = useState<boolean>(true);
  const sceneMap = useMemo(
    () =>
      renderScene(
        joinedSpacesRef,
        allSpacesRef,
        joinedSpacesFilter,
        allSpacesFilter
      ),
    [joinedSpacesFilter, allSpacesFilter]
  );

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      labelStyle={[styles.labelStyle, { color: colors.textColor }]}
      indicatorStyle={[
        styles.indicatorStyle,
        { color: colors.textColor, backgroundColor: colors.indicatorColor },
      ]}
      activeColor={colors.textColor}
      style={{
        backgroundColor: colors.bgDefault,
        shadowOpacity: 0,
        elevation: 0,
        borderBottomColor: colors.borderColor,
        borderBottomWidth: 1,
      }}
      inactiveColor={colors.textColor}
    />
  );

  useEffect(() => {
    getExplore(exploreDispatch);
    getFollows(connectedAddress, authDispatch);
    setIsInitial(false);
  }, []);

  useEffect(() => {
    if (!isInitial) {
      getFollows(connectedAddress, authDispatch);
    }
  }, [connectedAddress]);

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <TimelineHeader
        joinedSpacesFilter={joinedSpacesFilter}
        allSpacesFilter={allSpacesFilter}
        currentIndex={index}
        showBottomSheetModal={() => {
          const stateFilters = proposal.getStateFilters();
          const allFilter = stateFilters[0];
          const activeFilter = stateFilters[1];
          const pendingFilter = stateFilters[2];
          const closedFilter = stateFilters[3];
          const options = [
            allFilter.text,
            activeFilter.text,
            pendingFilter.text,
            closedFilter.text,
          ];
          const setFilter =
            index === 0 ? setJoinedSpacesFilter : setAllSpacesFilter;
          const onChangeFilter =
            index === 0
              ? joinedSpacesRef.current?.onChangeFilter ?? function () {}
              : allSpacesRef.current?.onChangeFilter ?? function () {};
          bottomSheetModalDispatch({
            type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
            payload: {
              options,
              snapPoints: [10, 250],
              show: true,
              initialIndex: 1,
              onPressOption: (index: number) => {
                if (index === 0) {
                  setFilter(allFilter);
                  onChangeFilter(allFilter.key);
                } else if (index === 1) {
                  setFilter(activeFilter);
                  onChangeFilter(activeFilter.key);
                } else if (index === 2) {
                  setFilter(pendingFilter);
                  onChangeFilter(pendingFilter.key);
                } else if (index === 3) {
                  setFilter(closedFilter);
                  onChangeFilter(closedFilter.key);
                }
                bottomSheetModalRef?.current?.close();
              },
            },
          });
        }}
        useFollowedSpaces={index === 0}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={sceneMap}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}

export default FeedScreenTabView;
