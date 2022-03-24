import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import SpaceAvatar from "components/SpaceAvatar";
import { useAuthState } from "context/authContext";
import * as Progress from "react-native-progress";
import get from "lodash/get";
import { n } from "helpers/miscUtils";
import i18n from "i18n-js";
import { PROPOSAL_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/core";
import { Space } from "types/explore";
import { Proposal } from "types/proposal";
import Device from "helpers/device";
import IconFont from "components/IconFont";

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
  viewProposalClosedText: {
    fontSize: 14,
    fontFamily: "Calibre-Semibold",
    textTransform: "uppercase",
    marginBottom: Device.isIos() ? 10 : 0,
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
    marginBottom: 18,
    marginTop: 18,
  },
  winningTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
  },
  winningTitleContainer: {
    marginTop: 16,
  },
});

interface RecentVotedProposalsPreviewProps {
  space: Space;
  proposal: Proposal;
  totalVotedProposals: number;
  index: number;
}

function RecentVotedProposalPreview({
  space,
  proposal,
  totalVotedProposals,
  index,
}: RecentVotedProposalsPreviewProps) {
  const { colors } = useAuthState();
  const winningChoiceIndex = useMemo(
    () => proposal?.scores?.indexOf(Math.max(...proposal.scores)),
    [proposal]
  );
  const winningChoiceTitle = get(proposal.choices, winningChoiceIndex, "");
  const scoresTotal = proposal.scores_total;
  const currentScore: any = get(
    proposal?.scores,
    winningChoiceIndex,
    undefined
  );
  const calculatedScore = (1 / scoresTotal) * currentScore;
  const formattedCalculatedScore = n(calculatedScore, "0.[0]%");
  const navigation: any = useNavigation();
  const totalVotedProposalsIndicators = new Array(totalVotedProposals).fill(1);
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
          <Text
            style={[styles.viewProposalClosedText, { color: colors.textColor }]}
          >
            {i18n.t("closedProposalsYouVoted")}
          </Text>
          <View
            style={[
              styles.viewProposalContainer,
              { backgroundColor: "#F3F4F7" },
            ]}
          >
            <Text style={[styles.viewProposal, { color: "#444C5F" }]}>
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
          <Text style={[styles.winningTitle, { color: "#A1A9BA" }]}>
            {i18n.t("winner")}
          </Text>
        </View>
        <View>
          <View style={styles.winningResultTextContainer}>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  backgroundColor: "rgba(249, 187, 96, 0.3)",
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                  marginRight: 4,
                  borderRadius: 6,
                }}
              >
                <IconFont name="signature" size={12} color={"#F7A426"} />
              </View>
              <Text
                style={[styles.winningResultText, { color: colors.textColor }]}
              >
                {winningChoiceTitle}
              </Text>
            </View>
            <Text
              style={[styles.winningResultText, { color: colors.textColor }]}
            >
              {formattedCalculatedScore}
            </Text>
          </View>
          <Progress.Bar
            progress={calculatedScore}
            color={colors.bgBlue}
            unfilledColor={colors.borderColor}
            width={null}
            borderColor="transparent"
            height={4}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 16,
            justifyContent: "center",
          }}
        >
          {totalVotedProposalsIndicators.map((d, i) => {
            return (
              <View
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    i === index ? colors.textColor : colors.borderColor,
                  marginRight: 4,
                }}
              />
            );
          })}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default RecentVotedProposalPreview;
