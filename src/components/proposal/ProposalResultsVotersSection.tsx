import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import common from "styles/common";
import ActivityIndicator from "components/ActivityIndicator";
import i18n from "i18n-js";
import ProposalResultsBlock from "components/proposal/ProposalResultsBlock";
import { n } from "helpers/miscUtils";
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
        <ActivityIndicator size="small" color={colors.textColor} />
      </View>
    );
  }

  if (proposal.state === STATES.pending) {
    return (
      <View
        style={[
          common.containerHorizontalPadding,
          { marginTop: 28, paddingBottom: 28 },
        ]}
      >
        <Text style={[common.h3, { color: colors.textColor }]}>
          {i18n.t("proposalHasNotStartedYet")}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        common.containerHorizontalPadding,
        { marginTop: 28, paddingBottom: 100 },
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
