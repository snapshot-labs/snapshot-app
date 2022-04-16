import React, { useMemo } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuthState } from "context/authContext";
import ProposalInfoRow from "components/proposal/ProposalInfoRow";
import i18n from "i18n-js";
import { Proposal } from "types/proposal";
import UserAvatar from "components/UserAvatar";
import { getUsername, getUserProfile } from "helpers/profile";
import { useExploreState } from "context/exploreContext";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import map from "lodash/map";
import { USER_PROFILE } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";
import common from "styles/common";
import IconFont from "components/IconFont";
import { dateFormat, explorerUrl, n } from "helpers/miscUtils";

const styles = StyleSheet.create({
  proposalInfoBlockContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    paddingBottom: 18,
  },
  separator: {
    width: "100%",
    height: 1,
  },
  value: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginRight: 4,
    marginTop: 9,
  },
  statusTitle: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
  statusValue: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
    marginTop: 9,
  },
  statusContainer: {
    marginLeft: 17,
  },
});

function getVotingType(type: string) {
  switch (type) {
    case "basic":
    case "single-choice":
      return "singleChoiceVoting";
    case "approval":
      return "approvalVoting";
    case "quadratic":
      return "quadraticVoting";
    case "ranked-choice":
      return "rankedChoiceVoting";
    case "weighted":
      return "weightedVoting";
  }
  return "";
}

interface ProposalInfoBlockProps {
  proposal: Proposal;
}

function ProposalInfoBlock({ proposal }: ProposalInfoBlockProps) {
  const { colors, connectedAddress } = useAuthState();
  const { profiles } = useExploreState();
  const authorProfile = getUserProfile(proposal.author, profiles);
  const authorName = getUsername(
    proposal.author,
    authorProfile,
    connectedAddress ?? ""
  );
  const votingType = useMemo(() => getVotingType(proposal.type), [proposal]);
  const strategiesNames = map(
    proposal?.strategies,
    (strategy: any) => strategy.name
  );
  const navigation = useNavigation();
  const strategies =
    strategiesNames.length > 0
      ? strategiesNames.join(", ")
      : i18n.t("noStrategies");

  return (
    <View
      style={[
        styles.proposalInfoBlockContainer,
        { borderColor: colors.borderColor },
      ]}
    >
      <ProposalInfoRow
        icon="feed"
        title={i18n.t("strategies")}
        value={strategies}
      />
      <View
        style={[styles.separator, { backgroundColor: colors.borderColor }]}
      />
      <ProposalInfoRow
        title={i18n.t("author")}
        ValueComponent={() => {
          return (
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.push(USER_PROFILE, {
                  address: proposal?.author,
                });
              }}
            >
              <View>
                <Text style={[styles.value, { color: colors.textColor }]}>
                  {authorName}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
        }}
        IconComponent={() => {
          return (
            <UserAvatar
              size={14}
              address={proposal.author}
              key={`${proposal.author}`}
            />
          );
        }}
      />
      <View
        style={[styles.separator, { backgroundColor: colors.borderColor }]}
      />
      <ProposalInfoRow
        title={i18n.t("ipfs")}
        value={`#${proposal.id.slice(0, 7)}`}
        onPress={() => {
          const url = getUrl(proposal.id);
          Linking.openURL(url);
        }}
        icon="upload"
      />
      <View
        style={[styles.separator, { backgroundColor: colors.borderColor }]}
      />
      <ProposalInfoRow
        title={i18n.t("votingSystem")}
        value={votingType === "" ? "" : i18n.t(votingType)}
        icon="play"
      />
      <View
        style={[styles.separator, { backgroundColor: colors.borderColor }]}
      />
      <ProposalInfoRow
        title={i18n.t("status")}
        ValueComponent={() => {
          return (
            <View style={{ marginTop: 9 }}>
              <View style={common.row}>
                <View style={common.alignItemsCenter}>
                  <IconFont
                    name={"check"}
                    size={17}
                    color={colors.secondaryGray}
                  />
                  <View
                    style={{
                      width: 1,
                      height: 30,
                      backgroundColor: colors.borderColor,
                    }}
                  />
                </View>
                <View style={styles.statusContainer}>
                  <Text
                    style={[styles.statusTitle, { color: colors.textColor }]}
                  >
                    {i18n.t("created")}
                  </Text>
                  <Text
                    style={[
                      styles.statusValue,
                      { color: colors.secondaryGray },
                    ]}
                  >
                    {dateFormat(proposal.created)}
                  </Text>
                </View>
              </View>
              <View style={common.row}>
                <View style={common.alignItemsCenter}>
                  <IconFont
                    name={"check"}
                    size={17}
                    color={colors.secondaryGray}
                  />
                  <View
                    style={{
                      width: 1,
                      height: 30,
                      backgroundColor: colors.borderColor,
                    }}
                  />
                </View>
                <View style={styles.statusContainer}>
                  <Text
                    style={[styles.statusTitle, { color: colors.textColor }]}
                  >
                    {i18n.t("start")}
                  </Text>
                  <Text
                    style={[
                      styles.statusValue,
                      { color: colors.secondaryGray },
                    ]}
                  >
                    {dateFormat(proposal.start)}
                  </Text>
                </View>
              </View>
              <View style={common.row}>
                <View style={common.alignItemsCenter}>
                  <View
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: 8.5,
                      backgroundColor: colors.blueButtonBg,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <IconFont name={"play"} size={9} color={colors.white} />
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <Text
                    style={[styles.statusTitle, { color: colors.textColor }]}
                  >
                    {i18n.t("end")}
                  </Text>
                  <Text
                    style={[
                      styles.statusValue,
                      { color: colors.secondaryGray },
                    ]}
                  >
                    {dateFormat(proposal.end)}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        icon="calendar"
      />
      <View
        style={[styles.separator, { backgroundColor: colors.borderColor }]}
      />
      <ProposalInfoRow
        title={i18n.t("snapshot")}
        onPress={() => {
          const url = explorerUrl(
            proposal.space?.network,
            proposal.snapshot,
            "block"
          );
          Linking.openURL(url);
        }}
        value={n(proposal.snapshot, "0,0")}
        icon="snapshot"
      />
    </View>
  );
}

export default ProposalInfoBlock;
