import React, { useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Proposal } from "types/proposal";
import { n } from "helpers/miscUtils";
import { useAuthState } from "context/authContext";
import IconFont from "components/IconFont";
import get from "lodash/get";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    height: 40,
    marginTop: 4,
  },
  textContainer: {
    width: "100%",
    flexDirection: "row",
    zIndex: 1,
    alignItems: "center",
    height: 40,
    paddingHorizontal: 16,
  },
  background: {
    position: "absolute",
    height: 40,
    borderRadius: 6,
  },
  choice: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    lineHeight: 18,
    zIndex: 1,
  },
  score: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: "auto",
    lineHeight: 18,
    zIndex: 1,
  },
  scoreSymbol: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    lineHeight: 18,
    marginLeft: 6,
  },
});

interface ProposalPreviewFinalScoresProps {
  proposal: Proposal;
}

function ProposalPreviewFinalScores({
  proposal,
}: ProposalPreviewFinalScoresProps) {
  const { colors } = useAuthState();
  const winningChoice = useMemo(
    () => proposal?.scores?.indexOf(Math.max(...proposal.scores)),
    [proposal]
  );

  return (
    <View>
      {proposal?.choices?.map((choice: string, index: number) => {
        const currentScore = get(proposal?.scores, index, 0);
        const calculatedScore = n(
          (1 / proposal.scores_total) * currentScore,
          "0.[0]%"
        );

        const scoreSymbol = `${n(currentScore)} ${proposal?.space?.symbol}`;

        return (
          <View key={index} style={[styles.container]}>
            <View style={styles.textContainer}>
              {winningChoice === index && (
                <IconFont
                  name="check"
                  size={20}
                  color={colors.textColor}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={[
                  styles.choice,
                  { color: colors.textColor, maxWidth: "40%" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {choice}
              </Text>
              <Text
                style={[
                  styles.scoreSymbol,
                  { color: colors.darkGray, maxWidth: "39%" },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {scoreSymbol}
              </Text>
              <Text style={[styles.score, { color: colors.textColor }]}>
                {calculatedScore}
              </Text>
            </View>
            <View
              style={[
                styles.background,
                { width: calculatedScore, backgroundColor: colors.borderColor },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

export default ProposalPreviewFinalScores;
