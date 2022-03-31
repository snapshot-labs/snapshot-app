import React, { useEffect, useState } from "react";
import { View, Text, ViewStyle } from "react-native";
import i18n from "i18n-js";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";
import { getPower } from "helpers/snapshot";
import Button from "../Button";
import VotingSingleChoice from "../proposal/VotingSingleChoice";
import VotingRankedChoice from "../proposal/VotingRankedChoice";
import { useAuthState } from "context/authContext";
import VotingQuadratic from "../proposal/VotingQuadratic";
import VotingApproval from "../proposal/VotingApproval";
import common from "styles/common";
import { addressIsSnapshotWallet } from "helpers/address";
import { VOTE_CONFIRM_SCREEN } from "constants/navigation";
import { useBottomSheetModalRef } from "context/bottomSheetModalContext";

interface CastVoteModalProps {
  proposal: Proposal;
  space: Space;
  getProposal: () => void;
  voteButtonStyle?: ViewStyle;
  navigation: any;
}

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

function CastVoteModal({
  proposal,
  space,
  getProposal,
  navigation,
  voteButtonStyle = {
    width: "100%",
    paddingHorizontal: 16,
  },
}: CastVoteModalProps) {
  const { colors } = useAuthState();
  const { connectedAddress, isWalletConnect, snapshotWallets } = useAuthState();
  const [selectedChoices, setSelectedChoices] = useState<any>([]);
  const isSnapshotWallet = addressIsSnapshotWallet(
    connectedAddress ?? "",
    snapshotWallets
  );
  const bottomSheetModalRef = useBottomSheetModalRef();

  const [totalScore, setTotalScore] = useState(0);
  let VotesComponent;

  if (proposal.type === "single-choice" || proposal.type === "basic") {
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
  }, [space]);

  if (VotesComponent) {
    return (
      <>
        <View>
          <View
            style={{
              paddingVertical: 24,
              paddingHorizontal:
                proposal.type === "quadratic" || proposal.type === "weighted"
                  ? 8
                  : 24,
            }}
          >
            <VotesComponent
              proposal={proposal}
              selectedChoices={selectedChoices}
              setSelectedChoices={setSelectedChoices}
            />
          </View>

          <View style={voteButtonStyle}>
            <Button
              title={i18n.t("confirmVote")}
              onPress={() => {
                bottomSheetModalRef.current?.close();
                navigation.navigate(VOTE_CONFIRM_SCREEN, {
                  proposal,
                  selectedChoices,
                  space,
                  totalScore,
                  getProposal,
                });
              }}
              disabled={
                (!isSnapshotWallet && !isWalletConnect) ||
                selectedChoices.length === 0
              }
              buttonContainerStyle={{
                backgroundColor:
                  (!isSnapshotWallet && !isWalletConnect) ||
                  selectedChoices.length === 0
                    ? colors.borderColor
                    : colors.bgBlue,
                borderColor:
                  (!isSnapshotWallet && !isWalletConnect) ||
                  selectedChoices.length === 0
                    ? colors.borderColor
                    : colors.bgBlue,
              }}
              buttonTitleStyle={{
                color: colors.white,
              }}
            />
          </View>
        </View>
      </>
    );
  }

  return (
    <View
      style={[common.alignItemsCenter, common.justifyCenter, { width: "100%" }]}
    >
      <Text style={[common.h4, { color: colors.textColor }]}>
        {i18n.t("vote")}
      </Text>
    </View>
  );
}

export default CastVoteModal;
