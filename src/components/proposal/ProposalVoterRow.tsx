import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useAuthState } from "context/authContext";
import { getUsername, getUserProfile } from "helpers/profile";
import { useExploreState } from "context/exploreContext";
import i18n from "i18n-js";
import toLower from "lodash/toLower";
import UserAvatar from "components/UserAvatar";
import { getChoiceString, n } from "helpers/miscUtils";
import { Proposal } from "types/proposal";

const styles = StyleSheet.create({
  proposalVoterContainer: {
    flexDirection: "row",
    paddingVertical: 14,
    alignItems: "center",
  },
  voterName: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  votingPower: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
    marginTop: 4,
  },
  votingChoice: {
    marginLeft: "auto",
    width: 150,
  },
  votingChoiceText: {
    fontSize: 18,
    fontFamily: "Calibre-Semibold",
    textAlign: "right",
  },
  voterNameContainer: {
    marginLeft: 9,
  },
});

interface ProposalVoterRowProps {
  vote: any;
  proposal: Proposal;
}

function ProposalVoterRow({ vote, proposal }: ProposalVoterRowProps) {
  const { connectedAddress, colors } = useAuthState();
  const { profiles } = useExploreState();
  const voterProfile = getUserProfile(vote.voter, profiles);
  let voterName = getUsername(vote.voter, voterProfile, connectedAddress ?? "");
  if (toLower(connectedAddress) === toLower(vote.voter)) {
    voterName = i18n.t("you");
  }
  return (
    <View style={styles.proposalVoterContainer}>
      <UserAvatar size={28} address={vote.voter} key={`${vote.voter}`} />
      <View style={styles.voterNameContainer}>
        <Text style={[styles.voterName, { color: colors.textColor }]}>
          {voterName}
        </Text>
        <Text style={[styles.votingPower, { color: colors.secondaryGray }]}>
          {n(vote?.vp || vote?.balance)} {proposal.space?.symbol}
        </Text>
      </View>
      <View style={styles.votingChoice}>
        <Text style={[styles.votingChoiceText, { color: colors.textColor }]}>
          {getChoiceString(proposal, vote.choice)}
        </Text>
      </View>
    </View>
  );
}

export default ProposalVoterRow;
