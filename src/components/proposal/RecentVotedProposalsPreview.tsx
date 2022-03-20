import React, { useMemo, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import SpaceAvatar from "components/SpaceAvatar";
import { useAuthState } from "context/authContext";
import * as Progress from "react-native-progress";
import get from "lodash/get";
import { getResults } from "helpers/snapshot";
import apolloClient from "helpers/apolloClient";
import { PROPOSAL_VOTES_QUERY } from "helpers/queries";
import { n } from "helpers/miscUtils";
import StateBadge from "components/StateBadge";
import i18n from "i18n-js";
import isEmpty from "lodash/isEmpty";
import { PROPOSAL_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/core";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentVotedProposalPreviewContainer: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    margin: 16,
  },
  proposalTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
    marginLeft: 8,
    marginRight: 24,
  },
  proposalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  viewProposalContainer: {
    paddingVertical: 8,
    borderRadius: 30,
    paddingHorizontal: 16,
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  viewProposal: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
  winningResultText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  winningResultTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 8,
  },
  winningTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  winningTitleContainer: {
    marginTop: 16,
  },
});

function RecentVotedProposalPreview({ space, proposal }) {
  const { colors } = useAuthState();
  const [results, setResults] = useState<any>({});
  const winningChoiceTitle = get(
    proposal.choices,
    results.winningChoiceIndex,
    ""
  );
  const navigation: any = useNavigation();

  async function getResultsObj() {
    try {
      const result = await apolloClient.query({
        query: PROPOSAL_VOTES_QUERY,
        variables: {
          id: proposal.id,
        },
      });
      const votes = get(result, "data.votes", []);
      const updatedProposal = get(result, "data.proposal", {});
      const response = await getResults(
        updatedProposal.space,
        { ...proposal, ...updatedProposal },
        votes
      );

      const highestResultIndex = response.results?.resultsByVoteBalance.indexOf(
        Math.max(...response.results?.resultsByVoteBalance)
      );
      const winningChoicePercentage =
        ((100 / response.results?.sumOfResultsBalance) *
          response.results?.resultsByVoteBalance[highestResultIndex]) /
        1e2;

      setResults({
        winningChoicePercentage,
        winningChoiceIndex: highestResultIndex,
      });
    } catch (e) {
      console.log("RESULTS ERROR", e);
    }
  }

  useEffect(() => {
    getResultsObj();
  }, []);

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.push(PROPOSAL_SCREEN, { proposal });
      }}
    >
      <View
        style={[
          styles.recentVotedProposalPreviewContainer,
          { borderColor: colors.borderColor },
        ]}
      >
        <View style={styles.header}>
          <StateBadge state={proposal.state} />
          <View
            style={[
              styles.viewProposalContainer,
              { backgroundColor: colors.borderColor },
            ]}
          >
            <Text style={[styles.viewProposal, { color: colors.textColor }]}>
              {i18n.t("viewProposal")}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.proposalTitleContainer,
            { borderColor: colors.borderColor },
          ]}
        >
          <SpaceAvatar symbolIndex="space" size={28} space={space} />
          <Text
            style={[styles.proposalTitle, { color: colors.textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {proposal.title}
          </Text>
        </View>
        <View style={styles.winningTitleContainer}>
          <Text style={[styles.winningTitle, { color: colors.textColor }]}>
            {proposal.state === "active"
              ? i18n.t("currentWinner")
              : i18n.t("winner")}
          </Text>
        </View>
        {!isEmpty(results) && (
          <View>
            <View style={styles.winningResultTextContainer}>
              <Text
                style={[styles.winningResultText, { color: colors.textColor }]}
              >
                {winningChoiceTitle}
              </Text>
              <Text
                style={[styles.winningResultText, { color: colors.textColor }]}
              >
                {n(
                  !results.winningChoicePercentage
                    ? 0
                    : results.winningChoicePercentage,
                  "0.[00]%"
                )}
              </Text>
            </View>
            <Progress.Bar
              progress={
                !results?.winningChoicePercentage
                  ? 0
                  : results.winningChoicePercentage
              }
              color={colors.bgBlue}
              unfilledColor={colors.borderColor}
              width={null}
              borderColor="transparent"
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default RecentVotedProposalPreview;
