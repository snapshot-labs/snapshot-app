import { useAuthState } from "context/authContext";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import React, { useEffect, useState } from "react";
import { Proposal } from "types/proposal";
import { setProfiles } from "helpers/profile";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import ProposalPreview from "components/ProposalPreview";
import common from "styles/common";
import i18n from "i18n-js";
import { PROPOSALS_QUERY } from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import get from "lodash/get";
import uniqBy from "lodash/uniqBy";
import TimelineHeader from "components/timeline/TimelineHeader";
import proposal from "constants/proposal";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import moment from "moment-timezone";
import { sortProposals } from "helpers/proposalUtils";
import {
  NOTIFICATIONS_ACTIONS,
  useNotificationsDispatch,
} from "context/notificationsContext";
import { ContextDispatch } from "types/context";

const LOAD_BY = 100;

async function getProposals(
  followedSpaces: any,
  loadCount: number,
  proposals: Proposal[],
  setLoadCount: (loadCount: number) => void,
  setProposals: (proposals: Proposal[]) => void,
  isInitial: boolean,
  setLoadingMore: (loadingMore: boolean) => void,
  state: string,
  notificationsDispatch: ContextDispatch,
  setLoadingFilter?: (loadingFilter: boolean) => void
) {
  const sevenDaysAgo = parseInt(
    (moment().subtract(7, "days").valueOf() / 1e3).toFixed()
  );
  const query = {
    query: PROPOSALS_QUERY,
    variables: {
      first: LOAD_BY,
      skip: loadCount,
      space_in: followedSpaces.map((follow: any) => follow.space.id),
      start_gt: sevenDaysAgo,
      end_gt: sevenDaysAgo,
      state,
    },
  };
  try {
    const result = await apolloClient.query(query);
    const { updatedProposals, proposalTimes } = sortProposals(
      get(result, "data.proposals", [])
    );

    if (isInitial) {
      setProposals(updatedProposals);
      notificationsDispatch({
        type: NOTIFICATIONS_ACTIONS.SET_PROPOSALS,
        payload: {
          proposals: updatedProposals,
          proposalTimes,
        },
      });
    } else {
      const newProposals = uniqBy([...proposals, ...updatedProposals], "id");
      notificationsDispatch({
        type: NOTIFICATIONS_ACTIONS.SET_PROPOSALS,
        payload: {
          proposals: newProposals,
          proposalTimes,
        },
      });
      setProposals(newProposals);
      setLoadCount(loadCount + LOAD_BY);
    }
  } catch (e) {
    console.log(e);
  }
  setLoadingMore(false);
  if (setLoadingFilter) {
    setLoadingFilter(false);
  }
}
interface TimelineFeedProps {
  feedScreenIsInitial: boolean;
}
function TimelineFeed({ feedScreenIsInitial }: TimelineFeedProps) {
  const { followedSpaces, colors, connectedAddress } = useAuthState();
  const { profiles, spaces } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isInitial, setIsInitial] = useState<boolean>(true);
  const [loadingFilter, setLoadingFilter] = useState<boolean>(false);
  const [joinedSpacesFilter, setJoinedSpacesFilter] = useState(
    proposal.getStateFilters()[0]
  );
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const notificationsDispatch = useNotificationsDispatch();

  function onChangeFilter(newFilter: string) {
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
      notificationsDispatch,
      setLoadingFilter
    );
  }

  useEffect(() => {
    if (followedSpaces.length > 0) {
      setLoadingMore(true);
      getProposals(
        followedSpaces,
        loadCount,
        proposals,
        setLoadCount,
        setProposals,
        true,
        (loadingMore: boolean) => {
          setLoadingMore(loadingMore);
          setIsInitial(loadingMore);
        },
        joinedSpacesFilter.key,
        notificationsDispatch
      );
    } else {
      setIsInitial(false);
    }
  }, []);

  useEffect(() => {
    if (followedSpaces.length > 0 && !isInitial) {
      setLoadingMore(true);
      getProposals(
        followedSpaces,
        loadCount,
        proposals,
        setLoadCount,
        setProposals,
        true,
        (loadingMore) => {
          setLoadingMore(loadingMore);
          setIsInitial(loadingMore);
        },
        joinedSpacesFilter.key,
        notificationsDispatch
      );
    } else {
      setIsInitial(false);
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
    <View
      style={[
        common.screen,
        {
          backgroundColor: colors.bgDefault,
        },
      ]}
    >
      <View
        style={[
          common.headerContainer,
          {
            borderBottomColor: colors.borderColor,
            backgroundColor: colors.bgDefault,
          },
        ]}
      >
        <Text style={[common.screenHeaderTitle, { color: colors.textColor }]}>
          {i18n.t("timeline")}
        </Text>
      </View>
      <FlatList
        key={connectedAddress}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              if (followedSpaces.length > 0) {
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
                  joinedSpacesFilter.key,
                  notificationsDispatch
                );
              }
            }}
          />
        }
        ListHeaderComponent={
          <TimelineHeader
            isInitial={isInitial || feedScreenIsInitial}
            joinedSpacesFilter={joinedSpacesFilter}
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
              const setFilter = setJoinedSpacesFilter;
              bottomSheetModalDispatch({
                type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                payload: {
                  options,
                  snapPoints: [10, 250],
                  show: true,
                  key: "timeline-proposal-filters",
                  initialIndex: 1,
                  destructiveButtonIndex: -1,
                  onPressOption: (index: number) => {
                    setLoadingFilter(true);
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
          />
        }
        data={followedSpaces.length > 0 ? proposals : []}
        renderItem={(data) => {
          return (
            <ProposalPreview
              proposal={data.item}
              space={spaces[data.item?.space?.id]}
            />
          );
        }}
        keyExtractor={(item) => `timeline-${item.id}`}
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
            joinedSpacesFilter.key,
            notificationsDispatch
          );
        }}
        ListEmptyComponent={
          loadingMore || isInitial || feedScreenIsInitial ? (
            <View />
          ) : (
            <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
              <Text style={[common.subTitle, { color: colors.textColor }]}>
                {followedSpaces.length === 0
                  ? i18n.t("noSpacesJoinedYet")
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
      {loadingFilter && (
        <View
          style={{
            position: "absolute",
            top: 300,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <ActivityIndicator color={colors.textColor} size="large" />
        </View>
      )}
    </View>
  );
}

export default TimelineFeed;
