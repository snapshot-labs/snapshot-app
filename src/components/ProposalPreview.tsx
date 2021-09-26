import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import colors from "../constants/colors";
import { Proposal } from "../types/proposal";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";

const styles = StyleSheet.create({
  proposalPreviewContainer: {
    borderColor: colors.borderColor,
    borderBottomWidth: 1,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    marginBottom: 8,
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
  },
  statusContainer: {
    height: 28,
    borderRadius: 14,
    marginLeft: "auto",
  },
  title: {
    color: colors.headingColor,
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
          {proposal.space.name} by {proposal.author}
        </Text>
        <View style={styles.statusContainer}>
          <Text>{proposal.state}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.title}>{proposal.title}</Text>
      </View>
    </View>
  );
}

export default ProposalPreview;
