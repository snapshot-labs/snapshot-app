import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import SpaceAvatar from "components/SpaceAvatar";
import { getUsername, getUserProfile } from "helpers/profile";
import { useAuthState } from "context/authContext";
import { useExploreState } from "context/exploreContext";
import Device from "helpers/device";
import { USER_PROFILE } from "constants/navigation";
import { useNavigation } from "@react-navigation/core";
import { Proposal } from "types/proposal";
import i18n from "i18n-js";
import MarkdownBody from "components/proposal/MarkdownBody";
import { n, toNow } from "helpers/miscUtils";
import { getPower } from "helpers/snapshot";
import UserAvatar from "components/UserAvatar";
import colors from "constants/colors";
import common from "styles/common";

const styles = StyleSheet.create({
  proposalCardContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    minHeight: Device.getDeviceHeight(),
  },
  spaceTitleAuthorTitleContainer: {
    marginLeft: 9,
  },
  authorTitle: {
    fontSize: 14,
    fontFamily: "Calibre-Semibold",
  },
  spaceTitle: {
    fontSize: 14,
    fontFamily: "Calibre-Semibold",
  },
  proposalTitle: {
    fontSize: 22,
    fontFamily: "Calibre-Medium",
    marginTop: 28,
  },
  startedTimeText: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
    color: colors.secondaryGray,
  },
  timeLeftTitle: {
    fontSize: 14,
    fontFamily: "Calibre-Semibold",
    textTransform: "uppercase",
  },
  proposalEndContainer: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "rgba(33, 150, 83, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  proposalTimeLeftContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  proposalEndText: {
    fontFamily: "Calibre-Semibold",
    color: colors.baseGreen2,
    fontSize: 14,
  },
  votingPowerContainer: {
    paddingHorizontal: 6,
    height: 26,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  votingPowerText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
    marginLeft: 6,
  },
});

async function loadPower(
  connectedAddress: string,
  proposal: Proposal,
  setTotalScore: (totalScore: number) => void
) {
  if (!connectedAddress || !proposal.author) return;
  const response = await getPower(proposal.space, connectedAddress, proposal);

  if (typeof response.totalScore === "number") {
    setTotalScore(response.totalScore);
  }
}

interface ProposalCardProps {
  proposal: Proposal;
}

function ProposalCard({ proposal }: ProposalCardProps) {
  const { colors, connectedAddress } = useAuthState();
  const { profiles } = useExploreState();
  const authorProfile = getUserProfile(proposal?.author, profiles);
  const [totalScore, setTotalScore] = useState(0);
  const authorName = getUsername(
    proposal?.author ?? "",
    authorProfile,
    connectedAddress ?? ""
  );
  const navigation: any = useNavigation();
  const proposalEnd = i18n.t("endsInTimeAgo", {
    timeAgo: toNow(proposal?.end),
  });

  useEffect(() => {
    loadPower(connectedAddress, proposal, setTotalScore);
  }, [proposal]);

  return (
    <View
      style={[
        styles.proposalCardContainer,
        { backgroundColor: colors.bgDefault, borderColor: colors.borderColor },
      ]}
    >
      <View style={common.row}>
        <SpaceAvatar
          size={35}
          space={proposal?.space}
          symbolIndex="space"
          key={proposal?.space?.name}
        />
        <View style={styles.spaceTitleAuthorTitleContainer}>
          <View style={common.row}>
            <Text style={[styles.spaceTitle, { color: colors.textColor }]}>
              {proposal?.space?.name}
            </Text>
            <Text
              style={{
                fontFamily: "Calibre-Semibold",
                fontSize: 14,
                color: colors.secondaryGray,
              }}
            >
              {` ${i18n.t("by")} `}
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.push(USER_PROFILE, {
                  address: proposal?.author,
                });
              }}
            >
              <Text style={[styles.authorTitle, { color: colors.textColor }]}>
                {authorName}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.startedTimeText}>
              {i18n.t("startedTimeAgo", { timeAgo: toNow(proposal.start) })}
            </Text>
          </View>
        </View>
      </View>
      <View>
        <Text style={[styles.proposalTitle, { color: colors.textColor }]}>
          {proposal?.title}
        </Text>
        <View
          style={{
            height: 1,
            width: "100%",
            backgroundColor: colors.borderColor,
            marginVertical: 28,
          }}
        />
        <View style={styles.proposalTimeLeftContainer}>
          <View style={styles.proposalEndContainer}>
            <Text style={styles.proposalEndText}>{proposalEnd}</Text>
          </View>
          <View
            style={[
              styles.votingPowerContainer,
              { backgroundColor: colors.votingPowerBgColor },
            ]}
          >
            <UserAvatar address={connectedAddress} size={14} />
            <Text style={[styles.votingPowerText, { color: colors.textColor }]}>
              {n(totalScore)} {proposal?.space?.symbol}
            </Text>
          </View>
        </View>
        <MarkdownBody body={proposal?.body ?? ""} />
      </View>
    </View>
  );
}

export default ProposalCard;
