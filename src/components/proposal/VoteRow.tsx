import React from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import UserAvatar from "../UserAvatar";
import { getChoiceString, n } from "util/miscUtils";
import i18n from "i18n-js";
import colors from "constants/colors";
import { Space } from "types/explore";
import { Proposal } from "types/proposal";
import { useAuthState } from "context/authContext";
import { getUsername } from "util/profile";

const { width } = Dimensions.get("screen");

const contentWidth = width / 2 - 60;

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  rowValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowText: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
  },
});

type VoteRowProps = {
  vote: any;
  profiles: any;
  space: Space;
  setCurrentAuthorIpfsHash: (ipfsHash: string) => void;
  setShowReceiptModal: (showModal: boolean) => void;
  proposal: Proposal;
};

function VoteRow({
  vote,
  profiles,
  space,
  setCurrentAuthorIpfsHash,
  setShowReceiptModal,
  proposal,
}: VoteRowProps) {
  const { connectedAddress, colors } = useAuthState();
  const voterProfile = profiles[vote.voter];
  let voterName = getUsername(vote.voter, voterProfile, connectedAddress ?? "");
  if (connectedAddress === vote.voter) {
    voterName = i18n.t("you");
  }
  const isQuadraticOrRankedChoice =
    proposal.type === "quadratic" ||
    proposal.type === "ranked-choice" ||
    proposal.type === "weighted";

  return (
    <TouchableHighlight
      onPress={() => {
        setCurrentAuthorIpfsHash(vote.id);
        setShowReceiptModal(true);
      }}
      underlayColor={colors.highlightColor}
    >
      <View key={vote.id} style={[styles.row]}>
        <View style={styles.rowValueContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <UserAvatar
              size={20}
              address={vote.voter}
              imgSrc={voterProfile?.image}
              key={`${vote.voter}${voterProfile?.image}`}
            />
            <Text
              style={[
                styles.rowText,
                {
                  marginLeft: 6,
                  width: contentWidth,
                  marginTop: Platform.OS === "ios" ? 4 : 0,
                  color: colors.textColor,
                },
              ]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {voterName}
            </Text>
          </View>
          <Text
            style={[
              styles.rowText,
              {
                textAlign: "right",
                marginRight: 8,
                width: contentWidth,
                color: colors.textColor,
              },
            ]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {n(vote.balance)} {space.symbol}
          </Text>
        </View>
        {isQuadraticOrRankedChoice && (
          <Text style={[styles.rowText, { marginTop: 8 }]} ellipsizeMode="clip">
            {getChoiceString(proposal, vote.choice)}
          </Text>
        )}
      </View>
    </TouchableHighlight>
  );
}

export default React.memo(VoteRow);
