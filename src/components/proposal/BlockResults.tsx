import React, { useMemo } from "react";
import { View } from "react-native";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
import i18n from "i18n-js";
import Block from "../Block";
import { Space } from "types/explore";
import { useAuthState } from "context/authContext";
import ProposalFinalScores from "../ProposalPreviewFinalScores";

const ts = (Date.now() / 1e3).toFixed();

type BlockResultsProps = {
  resultsLoaded: boolean;
  results: any;
  proposal: any;
  space: Space;
};

function BlockResults({
  resultsLoaded,
  results,
  proposal,
  space,
}: BlockResultsProps) {
  const { colors } = useAuthState();
  const choices = useMemo(() => {
    if (proposal && proposal.choices) {
      const choices = proposal.choices.map((choice: any, i: number) => ({
        i,
        choice,
      }));
      if (results && results.resultsByVoteBalance) {
        return choices.sort(
          (a: any, b: any) =>
            results.resultsByVoteBalance[b.i] -
            results.resultsByVoteBalance[a.i]
        );
      }
      return choices;
    }
    return [];
  }, [results, proposal]);
  return (
    <Block
      title={ts >= proposal.end ? i18n.t("results") : i18n.t("currentResults")}
      Content={
        <View style={{ padding: 24 }}>
          {resultsLoaded ? (
            <ProposalFinalScores proposal={proposal} />
          ) : (
            <Placeholder
              style={{ justifyContent: "center", alignItems: "center" }}
              Animation={Fade}
            >
              <PlaceholderLine width={100} />
              <PlaceholderLine width={100} />
              <PlaceholderLine width={100} />
            </Placeholder>
          )}
        </View>
      }
    />
  );
}

export default BlockResults;
