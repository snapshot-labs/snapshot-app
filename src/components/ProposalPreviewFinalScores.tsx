import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Proposal } from "types/proposal";
import { n } from "helpers/miscUtils";
import { useAuthState } from "context/authContext";
import IconFont from "components/IconFont";
import get from "lodash/get";
import TextTicker from "react-native-text-ticker";

const { width: deviceWidth } = Dimensions.get("screen");

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
  },
  background: {
    position: "absolute",
    height: 40,
    borderRadius: 6,
  },
  choice: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    zIndex: 1,
  },
  score: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: "auto",
    lineHeight: 18,
    zIndex: 1,
    marginRight: 16,
  },
  scoreSymbol: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    lineHeight: 18,
    marginLeft: 20,
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
        const isWinningChoice = winningChoice === index;
        return (
          <View key={index} style={[styles.container]}>
            <View style={styles.textContainer}>
              <TextTicker
                style={[
                  styles.choice,
                  {
                    color: colors.textColor,
                    width: isWinningChoice
                      ? deviceWidth - 100
                      : deviceWidth - 110,
                    marginLeft: isWinningChoice ? 0 : 6,
                  },
                ]}
                duration={3000}
                loop
                repeatSpacer={50}
                marqueeOnMount
                marqueeDelay={1500}
                bounceDelay={300}
                scrollSpeed={1000}
                animationType="scroll"
              >
                {"  "}
                {isWinningChoice && (
                  <IconFont
                    name="check"
                    size={20}
                    color={colors.textColor}
                    style={{ marginRight: 6, marginLeft: 16 }}
                  />
                )}
                {`${isWinningChoice ? `  ${choice}` : choice}`}
                <Text
                  style={[styles.scoreSymbol, { color: colors.darkGray }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {`   ${scoreSymbol}`}
                </Text>
              </TextTicker>
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
