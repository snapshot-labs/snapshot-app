import React, { useState, useMemo, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MarkdownBody from "../components/proposal/MarkdownBody";
import { ScrollView, View, Text } from "react-native";
import { Proposal } from "../types/proposal";
import common from "../styles/common";
import { useExploreState } from "../context/exploreContext";
import { Space } from "../types/explore";
import { PROPOSAL_QUERY, PROPOSAL_VOTES_QUERY } from "../util/queries";
import apolloClient from "../util/apolloClient";
import StateBadge from "../components/StateBadge";
import BlockInformation from "../components/proposal/BlockInformation";
import get from "lodash/get";
import BlockVotes from "../components/proposal/BlockVotes";
import getProvider from "@snapshot-labs/snapshot.js/src/utils/provider";
import { getResults } from "../util/snapshot";
import BackButton from "../components/BackButton";
import BlockResults from "../components/proposal/BlockResults";
import BlockCastVote from "../components/proposal/BlockCastVote";

type ProposalScreenProps = {
  route: {
    params: {
      proposal: Proposal;
    };
  };
};

function getSpace(
  spaces: { [spaceId: string]: Space },
  proposal: Proposal
): Space | {} {
  if (proposal.space) {
    const spaceId = proposal.space.id;
    const space = spaces[spaceId] ?? {};
    return {
      id: spaceId,
      ...space,
    };
  }

  return {};
}

async function getProposal(
  proposal: Proposal,
  setProposal: (proposal: Proposal) => void,
  setLoaded: (loaded: boolean) => void,
  setVotes: (votes: any) => void
) {
  const result = await apolloClient.query({
    query: PROPOSAL_VOTES_QUERY,
    variables: {
      id: proposal.id,
    },
  });
  const votes = get(result, "data.votes", []);
  const updatedProposal = {
    ...proposal,
    ...get(result, "data.proposal", {}),
    votes: votes,
  };
  setProposal(updatedProposal);
  setVotes(votes);
  setLoaded(true);
}

async function getResultsObj(
  space: Space,
  proposal: Proposal,
  votes: any[],
  setVotes: (votes: any[]) => void,
  setResults: (results: any) => void,
  setResultsLoaded: (resultsLoaded: boolean) => void
) {
  const response = await getResults(space, proposal, votes);
  if (response.votes) {
    setVotes(response.votes);
    setResults(response.results);
  }
  setResultsLoaded(true);
}

function ProposalScreen({ route }: ProposalScreenProps) {
  const [proposal, setProposal] = useState<Proposal>(
    route.params.proposal ?? {}
  );
  const [loaded, setLoaded] = useState(false);
  const [votes, setVotes] = useState<any[]>([]);
  const [results, setResults] = useState({});
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
  const { spaces } = useExploreState();
  const space: any = useMemo(
    () => getSpace(spaces, proposal),
    [spaces, proposal]
  );
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getProposal(proposal, setProposal, setLoaded, setVotes);
  }, []);

  useEffect(() => {
    if (loaded) {
      getResultsObj(
        space,
        proposal,
        votes,
        setVotes,
        setResults,
        setResultsLoaded
      );
    }
  }, [loaded]);

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <BackButton title={space?.name} />
      <ScrollView
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <Text style={[common.h1, { marginBottom: 8, marginTop: 8 }]}>
          {proposal.title}
        </Text>
        <View style={{ alignSelf: "flex-start", marginBottom: 24 }}>
          <StateBadge state={proposal.state} />
        </View>
        <MarkdownBody body={proposal.body} />
        <BlockInformation proposal={proposal} space={space} />
        <View style={{ width: 10, height: 10 }} />

        {proposal?.state === "active" && (
          <>
            <BlockCastVote
              proposal={proposal}
              resultsLoaded={resultsLoaded}
              setScrollEnabled={setScrollEnabled}
              space={space}
            />
            <View style={{ width: 10, height: 10 }} />
          </>
        )}

        <BlockVotes
          proposal={proposal}
          votes={votes}
          space={space}
          resultsLoaded={resultsLoaded}
        />
        <View style={{ width: 10, height: 10 }} />
        <BlockResults
          resultsLoaded={resultsLoaded}
          results={results}
          proposal={proposal}
          space={space}
        />
        <View style={{ width: 10, height: 200 }} />
      </ScrollView>
    </View>
  );
}

export default ProposalScreen;
