import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import uniqBy from "lodash/uniqBy";
import apolloClient from "../util/apolloClient";
import { FOLLOWS_QUERY, PROPOSALS_QUERY } from "../util/queries";
import ProposalPreview from "../components/ProposalPreview";
import { Proposal } from "../types/proposal";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../context/authContext";
import get from "lodash/get";
import common from "../styles/common";

const LOAD_BY = 6;

async function getFollows(accountId, authDispatch) {
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
  const authDispatch = useAuthDispatch();
  const connector = useWalletConnect();
  const insets = useSafeAreaInsets();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    getFollows(connector.accounts[0], authDispatch);
  }, []);

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
      />
    </View>
  );
}

export default FeedScreen;
