import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  Text,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { Proposal } from "types/proposal";
import { PROPOSALS_QUERY, SPACES_QUERY } from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import { ContextDispatch } from "types/context";
import {
  EXPLORE_ACTIONS,
  useExploreDispatch,
  useExploreState,
} from "context/exploreContext";
import { Space } from "types/explore";
import { setProfiles } from "helpers/profile";
import common from "styles/common";
import ProposalPreview from "../ProposalPreview";
import i18n from "i18n-js";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import ProposalFilters from "components/proposal/ProposalFilters";
import proposal from "constants/proposal";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";

const { height: screenHeight } = Dimensions.get("screen");

const LOAD_BY = 6;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

async function getProposals(
  space: string,
  loadCount: number,
  proposals: Proposal[],
  setLoadCount: (loadCount: number) => void,
  setProposals: (proposals: Proposal[]) => void,
  isInitial: boolean,
  setLoadingMore: (loadingMore: boolean) => void,
  state: string,
  setEndReached: (endReached: boolean) => void
) {
  const query = {
    query: PROPOSALS_QUERY,
    variables: {
      first: LOAD_BY,
      skip: loadCount,
      space_in: [space],
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

  if (loadCount > proposals.length && proposalResult.length === 0) {
    setEndReached(true);
  }
}

async function getSpace(spaceId: string, exploreDispatch: ContextDispatch) {
  const query = {
    query: SPACES_QUERY,
    variables: {
      id_in: [spaceId],
    },
  };
  const result: any = await apolloClient.query(query);
  exploreDispatch({
    type: EXPLORE_ACTIONS.UPDATE_SPACES,
    payload: result.data.spaces,
  });
}

interface SpaceProposalsProps {
  space: Space;
  scrollProps: any;
  headerHeight?: number;
  spaceProposalsRef: any;
}
function SpaceProposals({
  space,
  scrollProps,
  headerHeight = 150,
  spaceProposalsRef,
}: SpaceProposalsProps) {
  const { refreshFeed, colors } = useAuthState();
  const { profiles } = useExploreState();
  const authDispatch = useAuthDispatch();
  const spaceId: string = get(space, "id", "");
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const [filter, setFilter] = useState(proposal.getStateFilters()[0]);
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const exploreDispatch = useExploreDispatch();

  function onRefresh() {
    setLoadCount(0);
    getProposals(
      spaceId,
      0,
      proposals,
      setLoadCount,
      setProposals,
      true,
      setLoadingMore,
      filter.key,
      setEndReached
    );
  }

  function onChangeFilter(newFilter: string) {
    setLoadCount(0);
    setLoadingMore(true);
    getProposals(
      spaceId,
      0,
      proposals,
      setLoadCount,
      setProposals,
      true,
      setLoadingMore,
      newFilter,
      setEndReached
    );
  }

  useEffect(() => {
    if (refreshFeed?.spaceId === spaceId) {
      onRefresh();
      authDispatch({
        type: AUTH_ACTIONS.SET_REFRESH_FEED,
        payload: null,
      });
    }
  }, [refreshFeed]);

  useEffect(() => {
    setLoadingMore(true);
    getProposals(
      spaceId,
      loadCount,
      proposals,
      setLoadCount,
      setProposals,
      true,
      setLoadingMore,
      filter.key,
      setEndReached
    );
    getSpace(spaceId, exploreDispatch);
  }, [space]);

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray = proposals.map((proposal: Proposal) => proposal.author);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    setProfiles(filteredArray, exploreDispatch);
  }, [space, proposals]);

  return (
    <View style={[common.screen, { backgroundColor: colors.bgDefault }]}>
      <AnimatedFlatList
        scrollEventThrottle={16}
        ref={spaceProposalsRef}
        bounces={false}
        contentContainerStyle={{ marginTop: headerHeight + 32 }}
        overScrollMode={"never"}
        data={proposals}
        keyExtractor={(item: Proposal, i) => item.id}
        renderItem={(data: { item: Proposal }) => {
          return <ProposalPreview proposal={data.item} space={space} />;
        }}
        ListHeaderComponent={
          <View
            style={{
              paddingRight: 16,
              paddingTop: Platform.OS === "ios" ? 24 : 7,
              paddingBottom: 6,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderColor,
              backgroundColor: colors.bgDefault,
            }}
          >
            <ProposalFilters
              filter={filter}
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
                bottomSheetModalDispatch({
                  type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                  payload: {
                    options,
                    snapPoints: [10, 250],
                    show: true,
                    key: `space-proposal-filters-${spaceId}`,
                    icons: [],
                    initialIndex: 1,
                    destructiveButtonIndex: -1,
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
              filterContainerStyle={{
                marginTop: 6,
              }}
            />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={false}
            progressViewOffset={200}
            colors={[colors.textColor]}
            tintColor={colors.textColor}
            titleColor={colors.textColor}
            onRefresh={onRefresh}
          />
        }
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          if (!endReached) {
            setLoadingMore(true);
            getProposals(
              spaceId,
              loadCount === 0 ? LOAD_BY : loadCount,
              proposals,
              setLoadCount,
              setProposals,
              false,
              setLoadingMore,
              filter.key,
              setEndReached
            );
          }
        }}
        ListEmptyComponent={
          loadingMore ? (
            <View />
          ) : (
            <View style={{ marginTop: 30, paddingHorizontal: 16 }}>
              <Text style={common.subTitle}>
                {i18n.t("cantFindAnyResults")}
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
                justifyContent: "flex-start",
                marginTop: 24,
                padding: 24,
                height: headerHeight + 150,
              }}
            >
              <ActivityIndicator color={colors.textColor} size="large" />
            </View>
          ) : (
            <View
              style={{
                width: "100%",
                height: proposals.length > 4 ? 400 : screenHeight / 2,
                backgroundColor: colors.bgDefault,
              }}
            />
          )
        }
        {...scrollProps}
      />
    </View>
  );
}

export default SpaceProposals;
