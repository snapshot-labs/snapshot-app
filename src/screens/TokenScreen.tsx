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
import { EXPLORE_ACTIONS, useExploreDispatch } from "../context/exploreContext";
import { ContextDispatch } from "../types/context";
import { useAuthState } from "../context/authContext";
import Button from "../components/Button";
import FollowButton from "../components/FollowButton";

const LOAD_BY = 6;

async function getProposals(
  space: string,
  loadCount: number,
  proposals: Proposal[],
  setLoadCount: (loadCount: number) => void,
  setProposals: (proposals: Proposal[]) => void,
  isInitial: boolean,
  setLoadingMore: (loadingMore: boolean) => void
) {
  const query = {
    query: PROPOSALS_QUERY,
    variables: {
      first: LOAD_BY,
      skip: loadCount,
      space_in: [space],
      state: "all",
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
  const space = route.params.space;
  const spaceId: string = get(space, "id", "");
  const insets = useSafeAreaInsets();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
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
      setLoadingMore
    );
    getSpace(spaceId, exploreDispatch);
  }, []);

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
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
                borderBottomWidth: 5,
                borderBottomColor: colors.black,
                alignSelf: "flex-start",
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
            setLoadingMore
          );
        }}
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
