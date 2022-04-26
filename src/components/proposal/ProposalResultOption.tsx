import React from "react";
import { Text, View, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";
import common from "styles/common";
import { n } from "helpers/miscUtils";
import { useAuthState } from "context/authContext";
import isNaN from "lodash/isNaN";

const styles = StyleSheet.create({
  resultsTextContainer: {
    marginBottom: 8,
    marginTop: 18,
  },
  resultsText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
    marginTop: 8,
  },
  voteAmountText: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginTop: 8,
  },
});

interface ProposalResultOptionProps {
  choice: string;
  score: number;
  voteAmount: string;
}

function ProposalResultOption({
  choice,
  score,
  voteAmount,
}: ProposalResultOptionProps) {
  const { colors } = useAuthState();
  const formattedCalculatedScore = n(isNaN(score) ? 0 : score, "0.[0]%");
  return (
    <View>
      <View style={styles.resultsTextContainer}>
        <View style={common.row}>
          <Text style={[styles.resultsText, { color: colors.textColor }]}>
            {choice}
          </Text>
        </View>
        <View style={[common.row, common.justifySpaceBetween]}>
          <Text
            style={[styles.voteAmountText, { color: colors.secondaryGray }]}
          >
            {voteAmount}
          </Text>
          <Text style={[styles.resultsText, { color: colors.textColor }]}>
            {formattedCalculatedScore}
          </Text>
        </View>
      </View>
      <Progress.Bar
        progress={isNaN(score) ? 0 : score}
        color={colors.bgBlue}
        unfilledColor={colors.borderColor}
        width={null}
        borderColor="transparent"
        height={4}
      />
    </View>
  );
}

export default ProposalResultOption;
