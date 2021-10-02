import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
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

const LOAD_BY = 6;

async function getProposals(
  followedSpaces: any,
  loadCount: number,
  proposals: Proposal[],
  setLoadCount: (loadCount: number) => void,
  setProposals: (proposals: Proposal[]) => void,
  isInitial: boolean,
  setLoadingMore: (loadingMore: boolean) => void,
  state: string
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

function FeedScreen() {
  const { followedSpaces } = useAuthState();
  const insets = useSafeAreaInsets();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<{ key: string; text: string }>(
    proposal.getStateFilters()[0]
  );

  useEffect(() => {
    if (followedSpaces.length > 0) {
      getProposals(
        followedSpaces,
        loadCount,
        proposals,
        setLoadCount,
        setProposals,
        true,
        setLoadingMore,
        filter.key
      );
    }
  }, [followedSpaces]);

  return (
    <View style={[common.screen, { paddingTop: insets.top }]}>
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
                filter.key
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
                newFilter
              );
            }}
          />
        }
        headerHeight={65}
        data={proposals}
        renderItem={(data) => {
          return <ProposalPreview proposal={data.item} />;
        }}
        keyExtractor={(item, i) => `${item.id}${i}`}
        onEndReachedThreshold={0.45}
        onEndReached={() => {
          setLoadingMore(true);
          getProposals(
            followedSpaces,
            loadCount,
            proposals,
            setLoadCount,
            setProposals,
            false,
            setLoadingMore,
            filter.key
          );
        }}
        ListEmptyComponent={
          <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
            <Text style={common.subTitle}>
              {followedSpaces.length === 0
                ? i18n.t("noSpacesJoinedYet")
                : i18n.t("cantFindAnyResults")}
            </Text>
          </View>
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
    </View>
  );
}

export default FeedScreen;
