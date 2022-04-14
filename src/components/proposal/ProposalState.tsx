import React from "react";
import { Proposal } from "types/proposal";
import { StyleSheet, Text, View } from "react-native";
import colors from "constants/colors";
import { STATES } from "constants/proposal";
import { useAuthState } from "context/authContext";
import i18n from "i18n-js";
import { toNow } from "helpers/miscUtils";

const styles = StyleSheet.create({
  proposalStateContainer: {
    padding: 6,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  proposalStateText: {
    fontFamily: "Calibre-Semibold",
    color: colors.baseGreen2,
    fontSize: 14,
  },
});

function getBackgroundColor(state: string, colors: any) {
  if (state === STATES.closed) {
    return colors.basePurpleBg;
  } else if (state === STATES.active) {
    return colors.baseGreenBg;
  } else {
    return colors.votingPowerBgColor;
  }
}

function getTextColor(state: string, colors: any) {
  if (state === STATES.closed) {
    return colors.basePurple;
  } else if (state === STATES.active) {
    return colors.baseGreen;
  } else {
    return colors.textColor;
  }
}

interface ProposalStateProps {
  proposal: Proposal;
}

function ProposalState({ proposal }: ProposalStateProps) {
  const { colors } = useAuthState();
  const backgroundColor = getBackgroundColor(proposal?.state, colors);
  const textColor = getTextColor(proposal?.state, colors);
  const stateText =
    proposal?.state === STATES.closed
      ? i18n.t("closed")
      : i18n.t("endsInTimeAgo", {
          timeAgo: toNow(proposal?.end),
        });

  return (
    <View style={[styles.proposalStateContainer, { backgroundColor }]}>
      <Text style={[styles.proposalStateText, { color: textColor }]}>
        {stateText}
      </Text>
    </View>
  );
}

export default ProposalState;
