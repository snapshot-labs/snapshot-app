import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
// @ts-ignore
import ProgressBar from "react-native-progress/Bar";
import i18n from "i18n-js";
import Block from "../Block";
import { n } from "util/miscUtils";
import { Space } from "types/explore";
import { useAuthState } from "context/authContext";

const ts = (Date.now() / 1e3).toFixed();

const styles = StyleSheet.create({
  choiceTitle: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
  },
});

type BlockResultsProps = {
  resultsLoaded: boolean;
  results: any;
  proposal: any;
  space: Space;
};

function BlockResults({
  resultsLoaded,
  results,
  proposal,
  space,
}: BlockResultsProps) {
  const { colors } = useAuthState();
  const choices = useMemo(() => {
    if (proposal && proposal.choices) {
      const choices = proposal.choices.map((choice: any, i: number) => ({
        i,
        choice,
      }));
      if (results && results.resultsByVoteBalance) {
        return choices.sort(
          (a: any, b: any) =>
            results.resultsByVoteBalance[b.i] -
            results.resultsByVoteBalance[a.i]
        );
      }
      return choices;
    }
    return [];
  }, [results, proposal]);

  return (
    <Block
      title={ts >= proposal.end ? i18n.t("results") : i18n.t("currentResults")}
      Content={
        <View style={{ padding: 24 }}>
          {resultsLoaded ? (
            choices.map((choice: any, i: number) => (
              <View
                key={`${i}`}
                style={{ marginBottom: i === choices.length - 1 ? 0 : 16 }}
              >
                <Text style={[styles.choiceTitle, { color: colors.textColor }]}>
                  {choice.choice}{" "}
                </Text>
                <Text
                  style={[
                    styles.choiceTitle,
                    { marginTop: 4, color: colors.textColor },
                  ]}
                >
                  {n(
                    results && results.resultsByVoteBalance
                      ? results.resultsByVoteBalance[choice.i]
                      : 0
                  )}{" "}
                  {space.symbol}
                </Text>
                <Text
                  style={[
                    styles.choiceTitle,
                    { marginTop: 4, color: colors.textColor },
                  ]}
                >
                  {n(
                    !results.sumOfResultsBalance
                      ? 0
                      : ((100 / results.sumOfResultsBalance) *
                          results.resultsByVoteBalance[choice.i]) /
                          1e2,
                    "0.[00]%"
                  )}
                </Text>
                <ProgressBar
                  progress={
                    !results.sumOfResultsBalance
                      ? 0
                      : ((100 / results.sumOfResultsBalance) *
                          results.resultsByVoteBalance[choice.i]) /
                        1e2
                  }
                  color={colors.bgBlue}
                  unfilledColor={colors.borderColor}
                  width={null}
                  borderColor="transparent"
                />
              </View>
            ))
          ) : (
            <Placeholder
              style={{ justifyContent: "center", alignItems: "center" }}
              Animation={Fade}
            >
              <PlaceholderLine width={100} />
              <PlaceholderLine width={100} />
              <PlaceholderLine width={100} />
            </Placeholder>
          )}
        </View>
      }
    />
  );
}

export default BlockResults;
