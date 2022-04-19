import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Proposal } from "types/proposal";
import get from "lodash/get";
import toLower from "lodash/toLower";
import isEmpty from "lodash/isEmpty";
import { getChoiceString, n, toNow } from "helpers/miscUtils";
import ProposalResultOption from "components/proposal/ProposalResultOption";
import { useAuthState } from "context/authContext";
import UserAvatar from "components/UserAvatar";
import i18n from "i18n-js";
import common from "styles/common";

const styles = StyleSheet.create({
  proposalResultsBlockContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    paddingBottom: 18,
  },
  currentUserVoteContainer: {
    marginTop: 18,
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: "row",
  },
  votedForTextContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  votingForContainer: {
    marginLeft: 9,
  },
  voteText: {
    fontSize: 14,
    fontFamily: "Calibre-Semibold",
  },
  votingPower: {
    fontSize: 12,
    fontFamily: "Calibre-Medium",
  },
  circleSeparator: {
    width: 4,
    height: 4,
    borderRadius: 4,
    marginHorizontal: 6,
  },
});

function getCurrentUserVote(votes: any[], connectedAddress: string) {
  for (let i = 0; i < votes.length; i++) {
    const currentVote = votes[i];

    if (toLower(currentVote.voter) === toLower(connectedAddress)) {
      return currentVote;
    }
  }

  return undefined;
}

interface ProposalResultsBlockProps {
  proposal: Proposal;
  results?: any;
  votes: any[];
  votingPower: string;
}

function ProposalResultsBlock({
  proposal,
  results,
  votes,
  votingPower,
}: ProposalResultsBlockProps) {
  const { colors, connectedAddress } = useAuthState();
  const choices = proposal.choices
    .map((choice, i) => ({ index: i, choice }))
    .sort(
      (a, b) =>
        get(results?.resultsByVoteBalance, b.index, 0) -
        get(results?.resultsByVoteBalance, a.index, 0)
    );
  const currentUserVote = getCurrentUserVote(votes, connectedAddress);
  return (
    <View
      style={[
        styles.proposalResultsBlockContainer,
        { borderColor: colors.borderColor },
      ]}
    >
      {choices.map(({ choice, index }) => {
        let currentScore: any = get(proposal.scores, index, undefined);
        if (currentScore === undefined || results?.resultsByVoteBalance) {
          currentScore = get(results?.resultsByVoteBalance, index, 0);
        }
        let scoresTotal = proposal.scores_total;
        if (
          scoresTotal === undefined ||
          scoresTotal === 0 ||
          results?.sumOfResultsBalance
        ) {
          scoresTotal = results?.sumOfResultsBalance ?? 0;
        }
        const calculatedScore = (1 / scoresTotal) * currentScore;
        const voteAmount = `${n(currentScore)} ${proposal?.space?.symbol}`;

        return (
          <ProposalResultOption
            choice={choice}
            score={calculatedScore}
            voteAmount={voteAmount}
            key={index}
          />
        );
      })}
      {!isEmpty(currentUserVote) && (
        <View
          style={[
            styles.currentUserVoteContainer,
            { borderTopColor: colors.borderColor },
          ]}
        >
          <UserAvatar address={connectedAddress} size={22} />
          <View style={styles.votingForContainer}>
            <View style={styles.votedForTextContainer}>
              <Text style={[styles.voteText, { color: colors.textColor }]}>
                {i18n.t("you")}
              </Text>
              <Text
                style={[
                  styles.voteText,
                  { color: colors.secondaryGray, textTransform: "lowercase" },
                ]}
              >
                {` ${i18n.t("voted")} `}
              </Text>
              <Text
                style={[
                  styles.voteText,
                  { color: colors.textColor, width: 200 },
                ]}
              >
                {getChoiceString(proposal, currentUserVote.choice)}
              </Text>
            </View>
            <View style={[common.row, common.alignItemsCenter]}>
              <Text
                style={[styles.votingPower, { color: colors.secondaryGray }]}
              >
                {votingPower}
              </Text>
              <View
                style={[
                  styles.circleSeparator,
                  { backgroundColor: colors.secondaryGray },
                ]}
              />
              <Text
                style={[styles.votingPower, { color: colors.secondaryGray }]}
              >
                {toNow(currentUserVote.created)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default ProposalResultsBlock;
