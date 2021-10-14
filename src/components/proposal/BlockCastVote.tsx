import React, { useEffect, useState } from "react";
import i18n from "i18n-js";
import { Text, View } from "react-native";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
import Block from "../Block";
import { useNavigation } from "@react-navigation/native";
import colors from "../../constants/colors";
import { Proposal } from "../../types/proposal";
import { Space } from "../../types/explore";
import { getPower } from "../../util/snapshot";
import Button from "../Button";
import VotingSingleChoice from "./VotingSingleChoice";
import VotingRankedChoice from "./VotingRankedChoice";
import VoteConfirmModal from "./VoteConfirmModal";
import { useAuthState } from "../../context/authContext";
import VotingQuadratic from "./VotingQuadratic";
import VotingApproval from "./VotingApproval";

type BlockCastVoteProps = {
  proposal: Proposal;
  resultsLoaded: boolean;
  setScrollEnabled: (scrollEnabled: boolean) => void;
  space: Space;
  getProposal: () => void;
};

async function loadPower(
  connectedAddress: string,
  proposal: Proposal,
  space: Space,
  setTotalScore: (totalScore: number) => void
) {
  if (!connectedAddress || !proposal.author) return;
  const response = await getPower(space, connectedAddress, proposal);
  if (typeof response.totalScore === "number") {
    setTotalScore(response.totalScore);
  }
}

function BlockCastVote({
  proposal,
  resultsLoaded,
  setScrollEnabled,
  space,
  getProposal,
}: BlockCastVoteProps) {
  const { connectedAddress, isWalletConnect } = useAuthState();
  const [selectedChoices, setSelectedChoices] = useState<any>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  let VotesComponent;

  if (proposal.type === "single-choice") {
    VotesComponent = VotingSingleChoice;
  } else if (proposal.type === "ranked-choice") {
    VotesComponent = VotingRankedChoice;
  } else if (proposal.type === "quadratic" || proposal.type === "weighted") {
    VotesComponent = VotingQuadratic;
  } else if (proposal.type === "approval") {
    VotesComponent = VotingApproval;
  }

  useEffect(() => {
    loadPower(connectedAddress ?? "", proposal, space, setTotalScore);
  }, []);

  if (VotesComponent) {
    return (
      <>
        <Block
          title={i18n.t("castYourVote")}
          Content={
            <View
              style={{
                paddingVertical: 24,
                paddingHorizontal:
                  proposal.type === "quadratic" || proposal.type === "weighted"
                    ? 8
                    : 24,
              }}
            >
              {resultsLoaded ? (
                <VotesComponent
                  proposal={proposal}
                  selectedChoices={selectedChoices}
                  setSelectedChoices={setSelectedChoices}
                  setScrollEnabled={setScrollEnabled}
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
                onPress={() => {
                  setModalVisible(true);
                }}
                disabled={!isWalletConnect || selectedChoices.length === 0}
                buttonContainerStyle={{
                  backgroundColor: colors.bgBlue,
                }}
              />
            </View>
          }
        />
        <VoteConfirmModal
          isVisible={modalVisible}
          onClose={() => {
            setModalVisible(false);
          }}
          proposal={proposal}
          selectedChoices={selectedChoices}
          space={space}
          totalScore={totalScore}
          getProposal={getProposal}
        />
      </>
    );
  }
  return <View />;
}

export default BlockCastVote;
