import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import colors from "../constants/colors";
import { Proposal } from "../types/proposal";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import { shorten } from "../util/miscUtils";
import StateBadge from "./StateBadge";

const styles = StyleSheet.create({
  proposalPreviewContainer: {
    borderColor: colors.borderColor,
    borderBottomWidth: 1,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  headerAuthor: {
    color: colors.darkGray,
    fontSize: 18,
    marginLeft: 8,
    fontFamily: "Calibre-Medium",
    lineHeight: 28,
    marginRight: 10,
  },
  statusContainer: {
    marginLeft: "auto",
  },
  title: {
    color: colors.headingColor,
    fontFamily: "Calibre-Semibold",
    fontSize: 24,
  },
  body: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
  },
});

type ProposalPreviewProps = {
  proposal: Proposal;
};

function ProposalPreview({ proposal }: ProposalPreviewProps) {
  return (
    <View style={styles.proposalPreviewContainer}>
      <View style={styles.header}>
        <Image
          source={{ uri: getUrl(proposal.space.avatar) }}
          style={styles.avatar}
        />
        <Text style={styles.headerAuthor}>
          {proposal.space.name} by {shorten(proposal.author)}
        </Text>
        <View style={styles.statusContainer}>
          <StateBadge state={proposal.state} />
        </View>
      </View>
      <View>
        <Text style={styles.title}>{shorten(proposal.title, 124)}</Text>
        <Text style={styles.body}>{shorten(proposal.body, 140)}</Text>
      </View>
    </View>
  );
}

export default ProposalPreview;
