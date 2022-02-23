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
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  voterContainer: {
    marginLeft: 10,
    marginRight: 16,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Calibre-Medium",
    fontSize: 16,
    lineHeight: 30,
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
        <SpaceAvatar symbolIndex="space" size={28} space={space} />
        <View style={styles.voterContainer}>
          <Text style={[styles.title, { color: colors.textColor }]}>
            {i18n.t("votedOnProposal", {
              choice: choiceString,
              title: proposal?.title,
            })}
          </Text>
          <Text style={styles.date}>
            {i18n.t("timeAgo", { timeAgo: toNow(voter.created) })}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
}

export default VotedOnProposalPreview;
