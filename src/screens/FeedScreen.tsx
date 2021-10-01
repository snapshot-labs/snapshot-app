import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import uniqBy from "lodash/uniqBy";
import get from "lodash/get";
import apolloClient from "../util/apolloClient";
import { PROPOSALS_QUERY } from "../util/queries";
import ProposalPreview from "../components/ProposalPreview";
import { Proposal } from "../types/proposal";
import { useAuthState } from "../context/authContext";
import common from "../styles/common";
import i18n from "i18n-js";

const LOAD_BY = 6;

async function getProposals(
  followedSpaces,
  loadCount,
  proposals,
  setLoadCount,
  setProposals,
  isInitial = false
) {
  const query = {
    query: PROPOSALS_QUERY,
    variables: {
      first: LOAD_BY,
      skip: loadCount,
      space_in: followedSpaces.map((follow) => follow.space.id),
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
}

function FeedScreen() {
  const { followedSpaces } = useAuthState();
  const insets = useSafeAreaInsets();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  useEffect(() => {
    if (followedSpaces.length > 0) {
      getProposals(
        followedSpaces,
        loadCount,
        proposals,
        setLoadCount,
        setProposals,
        true
      );
    }
  }, [followedSpaces]);

  return (
    <View style={[common.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={proposals}
        renderItem={(data) => {
          return <ProposalPreview proposal={data.item} />;
        }}
        onEndReachedThreshold={0.45}
        onEndReached={() => {
          getProposals(
            followedSpaces,
            loadCount,
            proposals,
            setLoadCount,
            setProposals
          );
        }}
        ListEmptyComponent={
          <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
            <Text style={common.subTitle}>{i18n.t("noSpacesJoinedYet")}</Text>
          </View>
        }
      />
    </View>
  );
}

export default FeedScreen;
