import React, { useEffect, useState } from "react";
import { Proposal } from "types/proposal";
import { PROPOSALS_QUERY } from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import { Space } from "types/explore";
import { setProfiles } from "helpers/profile";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import proposal from "constants/proposal";
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import ProposalFilters from "components/proposal/ProposalFilters";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import common from "styles/common";
import i18n from "i18n-js";
import ProposalPreview from "components/proposal/ProposalPreviewNew";
import AnimatedTabViewFlatList from "components/tabBar/AnimatedTabViewFlatList";
import Device from "helpers/device";

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

const LOAD_BY = 6;

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

interface SpaceProposalsTabProps {
  space: Space;
  isActive: boolean;
  routeKey: string;
  scrollY: Animated.Value;
  trackRef: (key: string, ref: FlatList<any>) => void;
  onMomentumScrollBegin: (e: ScrollEvent) => void;
  onMomentumScrollEnd: (e: ScrollEvent) => void;
  onScrollEndDrag: (e: ScrollEvent) => void;
  headerHeight: number;
}

function SpaceProposalsTab({
  space,
  isActive,
  routeKey,
  scrollY,
  trackRef,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  onScrollEndDrag,
  headerHeight,
}: SpaceProposalsTabProps) {
  const spaceId: string = get(space, "id", "");
  const { colors, refreshFeed } = useAuthState();
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadCount, setLoadCount] = useState<number>(0);
  const [loadingMore, setLoadingMore] = useState(true);
  const [endReached, setEndReached] = useState(false);
  const [filter, setFilter] = useState(proposal.getStateFilters()[0]);
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const authDispatch = useAuthDispatch();

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
  }, [spaceId]);

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
    try {
      const profilesArray = Object.keys(profiles);
      const addressArray = proposals.map(
        (proposal: Proposal) => proposal.author
      );
      const filteredArray = addressArray.filter((address) => {
        return !profilesArray.includes(address);
      });
      setProfiles(filteredArray, exploreDispatch);
    } catch (e) {}
  }, [spaceId, proposals]);

  return (
    <AnimatedTabViewFlatList
      data={proposals}
      renderItem={(data: { item: Proposal }) => {
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
      ListHeaderComponent={
        <View
          style={{
            paddingRight: 14,
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
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-start",
              marginTop: 24,
              padding: 24,
            }}
          >
            <ActivityIndicator color={colors.textColor} size="small" />
          </View>
        ) : (
          <View style={{ marginTop: 30, paddingHorizontal: 16 }}>
            <Text style={[common.subTitle, { color: colors.textColor }]}>
              {i18n.t("cantFindAnyResults")}
            </Text>
            <View
              style={{ width: 100, height: Device.getDeviceHeight() * 0.75 }}
            />
          </View>
        )
      }
      scrollY={isActive ? scrollY : undefined}
      onRef={(ref: any) => {
        trackRef(routeKey, ref);
      }}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScrollEndDrag={onScrollEndDrag}
      headerHeight={headerHeight}
      ListFooterComponent={
        loadingMore && proposals?.length > 0 ? (
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-start",
              marginTop: 24,
              padding: 24,
            }}
          >
            <ActivityIndicator color={colors.textColor} size="small" />
          </View>
        ) : (
          <View
            style={{
              width: "100%",
              height: 100,
              backgroundColor: colors.bgDefault,
            }}
          />
        )
      }
    />
  );
}

export default SpaceProposalsTab;
