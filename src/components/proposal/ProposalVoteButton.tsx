import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";
import { useNavigation } from "@react-navigation/native";
import { VOTE_SCREEN } from "constants/navigation";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";

const styles = StyleSheet.create({
  voteContainer: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  voteTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
});

interface ProposalVoteButtonProps {
  proposal: Proposal;
  space: Space;
  getProposal: () => void;
}

function ProposalVoteButton({
  proposal,
  space,
  getProposal,
}: ProposalVoteButtonProps) {
  const { colors } = useAuthState();
  const navigation: any = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(VOTE_SCREEN, { proposal, space, getProposal });
      }}
    >
      <View style={[styles.voteContainer, { backgroundColor: colors.bgBlue }]}>
        <Text style={[styles.voteTitle, { color: colors.white }]}>
          {i18n.t("castVote")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default ProposalVoteButton;
