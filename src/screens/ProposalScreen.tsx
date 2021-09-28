import React, { useState, useMemo, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MarkdownBody from "../components/proposal/MarkdownBody";
import { ScrollView, View, Text } from "react-native";
import { Proposal } from "../types/proposal";
import common from "../styles/common";
import { useExploreState } from "../context/exploreContext";
import { Space } from "../types/explore";
import { PROPOSAL_QUERY } from "../util/queries";
import apolloClient from "../util/apolloClient";
import StateBadge from "../components/StateBadge";
import BlockInformation from "../components/proposal/BlockInformation";
import get from "lodash/get";

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
  setProposal: (proposal: Proposal) => void
) {
  const result = await apolloClient.query({
    query: PROPOSAL_QUERY,
    variables: {
      id: proposal.id,
    },
  });
  const updatedProposal = {
    ...proposal,
    ...get(result, "data.proposal", {}),
  };
  setProposal(updatedProposal);
}

function ProposalScreen({ route }: ProposalScreenProps) {
  const [proposal, setProposal] = useState<Proposal>(
    route.params.proposal ?? {}
  );
  const { spaces } = useExploreState();
  const space: Space | {} = useMemo(
    () => getSpace(spaces, proposal),
    [spaces, proposal]
  );
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getProposal(proposal, setProposal);
  }, []);

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        <Text style={[common.h1, { marginBottom: 8, marginTop: 30 }]}>
          {proposal.title}
        </Text>
        <View style={{ alignSelf: "flex-start", marginBottom: 24 }}>
          <StateBadge state={proposal.state} />
        </View>
        <MarkdownBody body={proposal.body} />
        <BlockInformation proposal={proposal} space={space} />
      </ScrollView>
    </View>
  );
}

export default ProposalScreen;
