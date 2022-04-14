import React from "react";
import { Text, View, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";
import common from "styles/common";
import { n } from "helpers/miscUtils";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  resultsTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 18,
  },
  resultsText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  voteAmountText: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: 4,
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
  const formattedCalculatedScore = n(score, "0.[0]%");
  return (
    <View>
      <View style={styles.resultsTextContainer}>
        <View style={common.row}>
          <Text style={[styles.resultsText, { color: colors.textColor }]}>
            {choice}
          </Text>
          <Text
            style={[styles.voteAmountText, { color: colors.secondaryGray }]}
          >
            {voteAmount}
          </Text>
        </View>
        <Text style={[styles.resultsText, { color: colors.textColor }]}>
          {formattedCalculatedScore}
        </Text>
      </View>
      <Progress.Bar
        progress={score}
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
