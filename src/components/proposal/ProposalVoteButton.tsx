import React from "react";
import { View, StyleSheet } from "react-native";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";
import { useNavigation } from "@react-navigation/native";
import { VOTE_SCREEN } from "constants/navigation";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";
import Button from "components/Button";

const styles = StyleSheet.create({
  voteContainer: {
    marginHorizontal: 16,
    bottom: 30,
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
    <View style={styles.voteContainer}>
      <Button
        onPress={() => {
          navigation.navigate(VOTE_SCREEN, { proposal, space, getProposal });
        }}
        title={i18n.t("castVote")}
        buttonContainerStyle={{
          backgroundColor: colors.bgBlue,
          borderColor: colors.bgBlue,
        }}
        buttonTitleStyle={{ color: colors.white }}
      />
    </View>
  );
}

export default ProposalVoteButton;
