import { useAuthState } from "context/authContext";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import React, { useEffect, useState } from "react";
import { Proposal } from "types/proposal";
import { getUserProfile, setProfiles } from "helpers/profile";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ActivityIndicator from "components/ActivityIndicator";
import ProposalPreview from "components/proposal/ProposalPreviewNew";
import common from "styles/common";
import i18n from "i18n-js";
import { PROPOSALS_QUERY, USER_VOTES_QUERY } from "helpers/queries";
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
import { sortProposals } from "helpers/proposalUtils";
import {
  NOTIFICATIONS_ACTIONS,
  useNotificationsDispatch,
} from "context/notificationsContext";
import { ContextDispatch } from "types/context";
import RecentVotedProposalPreview from "components/proposal/RecentVotedProposalsPreview";
import IconFont from "components/IconFont";
import isEmpty from "lodash/isEmpty";
import { shorten } from "helpers/miscUtils";
import UserAvatar from "components/UserAvatar";
import { USER_PROFILE } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";

const LOAD_BY = 20;

async function getVotedProposals(address: string, setProposals: any) {
  try {
    const query = {
      query: USER_VOTES_QUERY,
      variables: {
        voter: address,
      },
    };

    const result = await apolloClient.query(query);
    const proposalVotes = get(result, "data.votes", []);
    const filteredProposalVotes = proposalVotes
      .filter((votedProposal: any) => {
        return votedProposal.proposal.state === "closed";
      })
      .slice(0, 5);

    setProposals(filteredProposalVotes);
  } catch (e) {}
}

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
  const query = {
    query: PROPOSALS_QUERY,
    variables: {
      first: LOAD_BY,
      skip: loadCount,
      space_in: followedSpaces.map((follow: any) => follow.space.id),
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
  const [votedProposals, setVotedProposals] = useState([]);
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const notificationsDispatch = useNotificationsDispatch();
  const profile = getUserProfile(connectedAddress, profiles);
  const ens = get(profile, "ens", undefined);
  const navigation: any = useNavigation();

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
    getVotedProposals(connectedAddress ?? "", setVotedProposals);
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
    getVotedProposals(connectedAddress ?? "", setVotedProposals);
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
            borderBottomColor: "transparent",
            backgroundColor: colors.bgDefault,
          },
        ]}
      >
        <IconFont
          name="snapshot"
          color={colors.yellow}
          size={30}
          style={{ marginLeft: 16 }}
        />
        {!isEmpty(connectedAddress) && (
          <TouchableOpacity
            onPress={() => {
              navigation.push(USER_PROFILE, { address: connectedAddress });
            }}
            style={{ marginLeft: "auto" }}
          >
            <View
              style={{
                flexDirection: "row",
                marginRight: 16,
                alignItems: "center",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.borderColor,
                paddingHorizontal: 8,
                paddingVertical: 6,
              }}
            >
              <UserAvatar
                size={20}
                address={connectedAddress}
                key={`${connectedAddress}${profile?.image}`}
              />
              <Text
                style={{
                  fontFamily: "Calibre-Medium",
                  fontSize: 18,
                  marginLeft: 4,
                  color: colors.textColor,
                }}
              >
                {isEmpty(ens) ? shorten(connectedAddress ?? "") : ens}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        key={connectedAddress}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            colors={["transparent"]}
            tintColor={colors.textColor}
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
          <>
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
              RecentActivityComponent={
                <>
                  {votedProposals.length > 0 && (
                    <>
                      <View
                        style={{
                          paddingLeft: 16,
                          paddingTop: 16,
                          paddingBottom: 0,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Calibre-Semibold",
                            color: colors.textColor,
                            fontSize: 20,
                          }}
                        >
                          {i18n.t("yourRecentActivity")}
                        </Text>
                      </View>
                      <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={votedProposals}
                        renderItem={({ item }: any) => {
                          return (
                            <RecentVotedProposalPreview
                              proposal={item.proposal}
                              space={spaces[item?.proposal.space?.id]}
                              choice={item.choice}
                            />
                          );
                        }}
                        ListFooterComponent={() => (
                          <View style={{ width: 50, height: 100 }} />
                        )}
                      />
                    </>
                  )}
                </>
              }
            />
          </>
        }
        data={followedSpaces.length > 0 ? proposals : []}
        renderItem={(data) => {
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
        showsVerticalScrollIndicator={false}
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
              }}
            >
              <ActivityIndicator color={colors.textColor} size="small" />
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
          <ActivityIndicator color={colors.textColor} size="small" />
        </View>
      )}
    </View>
  );
}

export default TimelineFeed;
