import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import i18n from "i18n-js";
import IconFont from "../IconFont";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import colors from "constants/colors";
import { Proposal } from "types/proposal";
import { dateFormat, n, explorerUrl } from "helpers/miscUtils";
import Block from "../Block";
import { Space } from "types/explore";
import UserAvatar from "../UserAvatar";
import SpaceAvatar from "../SpaceAvatar";
import { useExploreState } from "context/exploreContext";
import { getUsername, getUserProfile } from "helpers/profile";
import CoreBadge from "../CoreBadge";
import { useAuthState } from "context/authContext";
import { USER_PROFILE } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  row: {
    flexDirection: "row",
    lineHeight: 24,
    marginBottom: 4,
  },
  rowTitle: {
    fontSize: 18,
    color: colors.darkGray,
    fontFamily: "Calibre-Semibold",
  },
  rowValue: {
    marginLeft: "auto",
  },
  rowValueText: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
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

interface BlockInformationProps {
  proposal: Proposal;
  space: Space | any;
}

function BlockInformation({ proposal, space }: BlockInformationProps) {
  const { profiles } = useExploreState();
  const { connectedAddress, colors } = useAuthState();
  const authorProfile = getUserProfile(proposal.author, profiles);
  const authorName = getUsername(
    proposal.author,
    authorProfile,
    connectedAddress ?? ""
  );
  const proposalStart = useMemo(() => dateFormat(proposal.start), [proposal]);
  const proposalEnd = useMemo(() => dateFormat(proposal.end), [proposal]);
  const votingType = useMemo(() => getVotingType(proposal.type), [proposal]);
  const strategies: any = useMemo(
    () => proposal.strategies ?? space?.strategies ?? [],
    [proposal, space]
  );
  const symbols = useMemo(
    () => strategies.map((strategy: any) => strategy.params.symbol),
    [proposal, space]
  );
  const navigation: any = useNavigation();

  return (
    <Block
      title={i18n.t("information")}
      Content={
        <View style={styles.container}>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("strategies")}</Text>
            <View style={[styles.rowValue, { height: 20 }]}>
              <View style={{ flexDirection: "row" }}>
                {symbols.map((symbol: string, symbolIndex: number) => (
                  <View key={symbolIndex} style={{ marginLeft: 6 }}>
                    <SpaceAvatar
                      symbolIndex={symbolIndex}
                      size={20}
                      space={space}
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("author")}</Text>
            <View style={styles.rowValue}>
              <TouchableOpacity
                onPress={() => {
                  navigation.push(USER_PROFILE, {
                    address: proposal?.author,
                  });
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <UserAvatar
                    size={20}
                    address={proposal.author}
                    imgSrc={authorProfile?.image}
                    key={`${proposal.author}${authorProfile?.image}`}
                  />
                  <Text
                    style={[
                      styles.rowValueText,
                      { marginLeft: 4, color: colors.textColor },
                    ]}
                  >
                    {authorName}
                  </Text>
                  <CoreBadge
                    address={proposal.author}
                    members={space?.members}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("ipfs")}</Text>
            <View style={styles.rowValue}>
              <TouchableOpacity
                onPress={() => {
                  const url = getUrl(proposal.id);
                  Linking.openURL(url);
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={[styles.rowValueText, { color: colors.textColor }]}
                  >
                    #{proposal.id.slice(0, 7)}
                  </Text>
                  <IconFont
                    name="external-link"
                    size={20}
                    color={colors.darkGray}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("votingSystem")}</Text>
            <View style={styles.rowValue}>
              <Text style={[styles.rowValueText, { color: colors.textColor }]}>
                {votingType === "" ? "" : i18n.t(votingType)}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("start")}</Text>
            <View style={styles.rowValue}>
              <Text style={[styles.rowValueText, { color: colors.textColor }]}>
                {proposalStart}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("end")}</Text>
            <View style={styles.rowValue}>
              <Text style={[styles.rowValueText, { color: colors.textColor }]}>
                {proposalEnd}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("snapshot")}</Text>
            <View style={styles.rowValue}>
              <TouchableOpacity
                onPress={() => {
                  const url = explorerUrl(
                    space?.network,
                    proposal.snapshot,
                    "block"
                  );
                  Linking.openURL(url);
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={[styles.rowValueText, { color: colors.textColor }]}
                  >
                    {n(proposal.snapshot, "0,0")}
                  </Text>
                  <IconFont
                    name="external-link"
                    size={20}
                    color={colors.darkGray}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}

export default BlockInformation;
