import React from "react";
import { View } from "react-native";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
import i18n from "i18n-js";
import Block from "../Block";
import ProposalFinalScores from "../ProposalPreviewFinalScores";

const ts = (Date.now() / 1e3).toFixed();

interface BlockResultsProps {
  resultsLoaded: boolean;
  proposal: any;
}

function BlockResults({ resultsLoaded, proposal }: BlockResultsProps) {
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
