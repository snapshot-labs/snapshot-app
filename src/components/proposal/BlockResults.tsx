import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
import ProgressBar from "react-native-progress/Bar";
import i18n from "i18n-js";
import Block from "../Block";
import colors from "../../constants/colors";
import { n } from "../../util/miscUtils";

const ts = (Date.now() / 1e3).toFixed();

const styles = StyleSheet.create({
  choiceTitle: {
    fontSize: 18,
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
  },
});

function BlockResults({ resultsLoaded, results, proposal, space }) {
  const choices = useMemo(() => {
    if (proposal && proposal.choices) {
      const choices = proposal.choices.map((choice: any, i: number) => ({
        i,
        choice,
      }));
      if (results && results.resultsByVoteBalance) {
        return choices.sort(
          (a, b) =>
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
                <Text style={styles.choiceTitle}>{choice.choice} </Text>
                <Text style={[styles.choiceTitle, { marginTop: 4 }]}>
                  {n(
                    results && results.resultsByVoteBalance
                      ? results.resultsByVoteBalance[choice.i]
                      : 0
                  )}{" "}
                  {space.symbol}
                </Text>
                <Text style={[styles.choiceTitle, { marginTop: 4 }]}>
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
