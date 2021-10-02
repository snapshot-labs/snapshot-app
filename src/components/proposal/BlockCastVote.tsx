import React, { useState } from "react";
import i18n from "i18n-js";
import { Text, View } from "react-native";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
import Block from "../Block";
import VotingSingleChoice from "./VotingSingleChoice";
import Button from "../Button";
import colors from "../../constants/colors";

function BlockCastVote({ proposal, resultsLoaded }) {
  const [selectedChoice, setSelectedChoice] = useState(-1);
  let VotesComponent;

  if (proposal.type === "single-choice") {
    VotesComponent = VotingSingleChoice;
  }

  if (VotesComponent) {
    return (
      <Block
        title={i18n.t("castYourVote")}
        Content={
          <View style={{ padding: 24 }}>
            {resultsLoaded ? (
              <VotingSingleChoice
                proposal={proposal}
                selectedChoice={selectedChoice}
                setSelectedChoice={setSelectedChoice}
              />
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

            <Button
              title={i18n.t("vote")}
              onPress={() => {}}
              disabled={selectedChoice === -1}
              buttonContainerStyle={{
                backgroundColor: colors.bgBlue,
              }}
            />
          </View>
        }
      />
    );
  }
  return <View />;
}

export default BlockCastVote;
