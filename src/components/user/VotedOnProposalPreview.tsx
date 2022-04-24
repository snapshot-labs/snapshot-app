import React from "react";
import { StyleSheet, TouchableHighlight, View, Text } from "react-native";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";
import i18n from "i18n-js";
import { PROPOSAL_SCREEN } from "constants/navigation";
import { useAuthState } from "context/authContext";
import { useNavigation } from "@react-navigation/native";
import colors from "constants/colors";
import SpaceAvatar from "components/SpaceAvatar";
import { getChoiceString, toNow } from "helpers/miscUtils";

const styles = StyleSheet.create({
  proposalPreviewContainer: {
    borderColor: colors.borderColor,
    borderBottomWidth: 1,
    paddingVertical: 24,
    marginHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  voterContainer: {
    marginLeft: 10,
    marginRight: 16,
    justifyContent: "center",
  },
  votedFor: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
  },
  titleText: {
    marginTop: 9,
    fontSize: 18,
    fontFamily: "Calibre-Medium",
  },

  date: {
    fontFamily: "Calibre-Medium",
    fontSize: 16,
    marginTop: 8,
  },
});

interface VotedOnProposalPreviewProps {
  proposal: Proposal;
  space: Space;
  voter: any;
}

function VotedOnProposalPreview({
  proposal,
  space,
  voter,
}: VotedOnProposalPreviewProps) {
  const { colors } = useAuthState();
  const navigation: any = useNavigation();
  const choiceString = getChoiceString(proposal, voter.choice);

  return (
    <TouchableHighlight
      underlayColor={colors.highlightColor}
      onPress={() => {
        navigation.push(PROPOSAL_SCREEN, { proposal });
      }}
    >
      <View
        style={[
          styles.proposalPreviewContainer,
          { borderColor: colors.borderColor },
        ]}
      >
        <SpaceAvatar symbolIndex="space" size={44} space={space} />
        <View style={styles.voterContainer}>
          <Text style={[styles.votedFor, { color: colors.secondaryGray }]}>
            {i18n.t("votedFor", {
              choice: choiceString,
            })}
          </Text>
          <Text style={[styles.titleText, { color: colors.textColor }]}>
            {proposal.title}
          </Text>
          <Text style={[styles.date, { color: colors.secondaryGray }]}>
            {i18n.t("timeAgo", { timeAgo: toNow(voter.created) })}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
}

export default VotedOnProposalPreview;
