import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import get from "lodash/get";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "i18n-js";
import { CollapsibleHeaderFlatList } from "react-native-collapsible-header-views";
import uniqBy from "lodash/uniqBy";
import colors from "../constants/colors";
import common from "../styles/common";
import { Space } from "../types/explore";
import Token from "../components/Token";
import { PROPOSALS_QUERY, SPACES_QUERY } from "../util/queries";
import apolloClient from "../util/apolloClient";
import { Proposal } from "../types/proposal";
import ProposalPreview from "../components/ProposalPreview";
import {
  EXPLORE_ACTIONS,
  useExploreDispatch,
  useExploreState,
} from "../context/exploreContext";
import { ContextDispatch } from "../types/context";
import { useAuthState } from "../context/authContext";
import FollowButton from "../components/FollowButton";
import ProposalFilters from "../components/proposal/ProposalFilters";
import proposal from "../constants/proposal";
import BackButton from "../components/BackButton";
import { setProfiles } from "../util/profile";

const LOAD_BY = 6;

async function getProposals(
  space: string,
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

type TokenScreenProps = {
  route: {
    params: {
      space: Space;
    };
  };
};
function TokenScreen({ route }: TokenScreenProps) {
  const { isWalletConnect } = useAuthState();
  const { profiles } = useExploreState();
  const space = route.params.space;
  const spaceId: string = get(space, "id", "");
  const insets = useSafeAreaInsets();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState(proposal.getStateFilters()[0]);
  const exploreDispatch = useExploreDispatch();

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
      filter.key
    );
    getSpace(spaceId, exploreDispatch);
  }, []);

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray = proposals.map((proposal: Proposal) => proposal.author);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    setProfiles(filteredArray, exploreDispatch);
  }, [proposals]);

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <BackButton />
      <CollapsibleHeaderFlatList
        data={proposals}
        clipHeader
        CollapsibleHeaderComponent={
          <View
            style={{
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderColor,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <View>
                <Token space={space} symbolIndex="space" size={60} />
                <Text style={[{ marginTop: 16 }, common.headerTitle]}>
                  {get(space, "name")}
                </Text>
                <Text style={[{ marginTop: 4 }, common.subTitle]}>
                  {get(space, "id")}
                </Text>
              </View>
              {isWalletConnect && (
                <View style={{ marginLeft: "auto", marginTop: 20 }}>
                  <FollowButton space={space} />
                </View>
              )}
            </View>
            <View
              style={{
                alignSelf: "flex-start",
                flexDirection: "row",
                width: "100%",
              }}
            >
              <View
                style={{
                  borderBottomWidth: 5,
                  borderBottomColor: colors.black,
                }}
              >
                <Text
                  style={[
                    {
                      marginTop: 24,
                    },
                    common.subTitle,
                  ]}
                >
                  {i18n.t("proposals")}
                </Text>
              </View>
              <View
                style={{
                  alignSelf: "flex-end",
                  marginLeft: "auto",
                  borderBottomWidth: 5,
                  borderBottomColor: "white",
                }}
              >
                <ProposalFilters
                  filter={filter}
                  setFilter={setFilter}
                  onChangeFilter={(newFilter) => {
                    setLoadCount(0);
                    getProposals(
                      spaceId,
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
              </View>
            </View>
          </View>
        }
        headerHeight={200}
        renderItem={(data) => {
          return <ProposalPreview proposal={data.item} />;
        }}
        onEndReachedThreshold={0.45}
        onEndReached={() => {
          setLoadingMore(true);
          getProposals(
            spaceId,
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
          loadingMore ? (
            <View />
          ) : (
            <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
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

export default TokenScreen;
