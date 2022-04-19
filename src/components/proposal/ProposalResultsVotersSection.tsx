import React, { useEffect, useState } from "react";
import common from "styles/common";
import ProposalResultsBlock from "components/proposal/ProposalResultsBlock";
import { n } from "helpers/miscUtils";
import { ActivityIndicator, View } from "react-native";
import ProposalVotersBlock from "components/proposal/ProposalVotersBlock";
import { Space } from "types/explore";
import { Proposal } from "types/proposal";
import { getResults } from "helpers/snapshot";
import { STATES } from "constants/proposal";
import { useAuthState } from "context/authContext";

async function getResultsObj(
  space: Space,
  proposal: Proposal,
  votes: any[],
  setResults: (results: any) => void,
  setResultsLoaded: (resultsLoaded: boolean) => void
) {
  const response = await getResults(space, proposal, votes);
  if (response?.results) {
    setResults(response.results);
  }
  setResultsLoaded(true);
}

interface ProposalResultsVotersSectionProps {
  proposal: Proposal;
  space: Space;
  votes: any[];
  votingPower: number;
  loading: boolean;
  castedVote: number;
}

function ProposalResultsVotersSection({
  proposal,
  space,
  votes,
  votingPower,
  loading,
  castedVote,
}: ProposalResultsVotersSectionProps) {
  const { colors } = useAuthState();
  const [results, setResults] = useState({});
  const [resultsLoaded, setResultsLoaded] = useState<boolean>(
    proposal.state === STATES.closed
  );

  useEffect(() => {
    if (!loading && proposal?.state !== STATES.closed) {
      getResultsObj(space, proposal, votes, setResults, setResultsLoaded);
    }
  }, [loading, castedVote]);

  if (!resultsLoaded || loading) {
    return (
      <View
        style={[
          common.justifyCenter,
          common.alignItemsCenter,
          { width: "100%", marginTop: 28 },
        ]}
      >
        <ActivityIndicator size="large" color={colors.textColor} />
      </View>
    );
  }

  return (
    <View
      style={[
        common.containerHorizontalPadding,
        { marginTop: 28, paddingBottom: 28 },
      ]}
    >
      <ProposalResultsBlock
        proposal={proposal}
        results={results}
        votes={votes}
        votingPower={`${n(votingPower)} ${proposal.space?.symbol}`}
      />
      <View style={{ width: 10, height: 24 }} />
      <ProposalVotersBlock proposal={proposal} votes={votes} />
    </View>
  );
}

export default ProposalResultsVotersSection;
