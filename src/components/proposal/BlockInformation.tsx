import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import i18n from "i18n-js";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import colors from "../../constants/colors";
import { Proposal } from "../../types/proposal";
import { dateFormat, n, explorerUrl } from "../../util/miscUtils";
import Block from "../Block";
import { Space } from "../../types/explore";
import UserAvatar from "../UserAvatar";
import SpaceAvatar from "../SpaceAvatar";
import { useExploreState } from "../../context/exploreContext";
import { getUsername } from "../../util/profile";
import CoreBadge from "../CoreBadge";
import { useAuthState } from "../../context/authContext";

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

type BlockInformationProps = {
  proposal: Proposal;
  space: Space | any;
};

function BlockInformation({ proposal, space }: BlockInformationProps) {
  const { profiles } = useExploreState();
  const { connectedAddress } = useAuthState()
  const authorProfile = profiles[proposal.author];
  const authorName = getUsername(proposal.author, authorProfile, connectedAddress ?? "");
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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <UserAvatar
                  size={20}
                  address={proposal.author}
                  imgSrc={authorProfile?.image}
                  key={`${proposal.author}${authorProfile?.image}`}
                />
                <Text style={[styles.rowValueText, { marginLeft: 4 }]}>
                  {authorName}
                </Text>
                <CoreBadge address={proposal.author} members={space?.members} />
              </View>
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
                  <Text style={styles.rowValueText}>
                    #{proposal.id.slice(0, 7)}
                  </Text>
                  <FontAwesome5Icon
                    name="external-link-alt"
                    style={{ marginLeft: 8 }}
                    size={12}
                    color={colors.darkGray}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("votingSystem")}</Text>
            <View style={styles.rowValue}>
              <Text style={styles.rowValueText}>
                {votingType === "" ? "" : i18n.t(votingType)}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("start")}</Text>
            <View style={styles.rowValue}>
              <Text style={styles.rowValueText}>{proposalStart}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("end")}</Text>
            <View style={styles.rowValue}>
              <Text style={styles.rowValueText}>{proposalEnd}</Text>
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
                  <Text style={styles.rowValueText}>
                    {n(proposal.snapshot, "0,0")}
                  </Text>
                  <FontAwesome5Icon
                    name="external-link-alt"
                    style={{ marginLeft: 8 }}
                    size={12}
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
