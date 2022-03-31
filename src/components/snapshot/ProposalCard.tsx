import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import SpaceAvatar from "components/SpaceAvatar";
import { getUsername } from "helpers/profile";
import { useAuthState } from "context/authContext";
import { useExploreState } from "context/exploreContext";
import Device from "helpers/device";
import { USER_PROFILE } from "constants/navigation";
import { useNavigation } from "@react-navigation/core";
import { Proposal } from "types/proposal";
import i18n from "i18n-js";
import MarkdownBody from "components/proposal/MarkdownBody";
import { toNow } from "helpers/miscUtils";
import { Space } from "types/explore";
import { getPower } from "helpers/snapshot";
import UserAvatar from "components/UserAvatar";

const styles = StyleSheet.create({
  proposalCardContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    minHeight: Device.getDeviceHeight(),
  },
  proposalCardHeader: {
    flexDirection: "row",
  },
  authorTitle: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
  },
  spaceTitle: {
    fontSize: 22,
    fontFamily: "Calibre-Semibold",
  },
  proposalTitle: {
    fontSize: 22,
    fontFamily: "Calibre-Medium",
    marginTop: 32,
  },
  timeLeftTitle: {
    fontSize: 14,
    fontFamily: "Calibre-Semibold",
    textTransform: "uppercase",
  },
  proposalEndContainer: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: "rgba(33, 150, 83, 0.2)",
    marginTop: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  proposalEndText: {
    fontFamily: "Calibre-Semibold",
    color: "rgba(39, 174, 96, 1)",
    fontSize: 14,
  },
  votingPowerContainer: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 9,
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
  proposal?: Proposal;
}

function ProposalCard({ proposal }: ProposalCardProps) {
  const { colors, connectedAddress, theme } = useAuthState();
  const { profiles } = useExploreState();
  const authorProfile = profiles[proposal?.author ?? ""];
  const [totalScore, setTotalScore] = useState(0);
  const authorName = getUsername(
    proposal?.author ?? "",
    authorProfile,
    connectedAddress ?? ""
  );
  const navigation: any = useNavigation();
  const proposalEnd = toNow(proposal?.end ?? 0);

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
      <View style={styles.proposalCardHeader}>
        <SpaceAvatar
          size={35}
          space={proposal?.space}
          symbolIndex="space"
          key={proposal?.space?.name}
        />
        <View style={{ marginLeft: 6 }}>
          <Text style={[styles.spaceTitle, { color: colors.textColor }]}>
            {proposal?.space?.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.push(USER_PROFILE, {
                address: proposal?.author,
              });
            }}
          >
            <Text style={[styles.authorTitle, { color: colors.darkGray }]}>
              {i18n.t("by")} {authorName}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={[styles.proposalTitle, { color: colors.textColor }]}>
          {proposal?.title}
        </Text>
        <View
          style={{
            height: 2,
            width: "100%",
            backgroundColor: colors.borderColor,
            marginTop: 24,
            marginBottom: 24,
          }}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={[styles.timeLeftTitle, { color: colors.darkGray }]}>
              {i18n.t("timeLeft")}
            </Text>
            <View style={styles.proposalEndContainer}>
              <Text style={styles.proposalEndText}>{proposalEnd}</Text>
            </View>
          </View>
          <View>
            <Text style={[styles.timeLeftTitle, { color: colors.darkGray }]}>
              {i18n.t("votingPower")}
            </Text>
            <View
              style={[
                styles.votingPowerContainer,
                { backgroundColor: colors.votingPowerBgColor },
              ]}
            >
              <UserAvatar address={connectedAddress} size={14} />
              <Text
                style={[styles.votingPowerText, { color: colors.textColor }]}
              >
                {totalScore} {proposal?.space?.symbol}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            height: 2,
            width: "100%",
            backgroundColor: colors.borderColor,
            marginTop: 24,
            marginBottom: 24,
          }}
        />
        <MarkdownBody body={proposal?.body ?? ""} />
      </View>
    </View>
  );
}

export default ProposalCard;
