import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "../Avatar";
import { getChoiceString, n, shorten } from "../../util/miscUtils";
import i18n from "i18n-js";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import colors from "../../constants/colors";
import makeBlockie from "ethereum-blockies-base64";
import { Space } from "../../types/explore";
import { Proposal } from "../../types/proposal";
import { useAuthState } from "../../context/authContext";

const { width } = Dimensions.get("screen");

const contentWidth3 = (width - 64) / 3;
const contentWidth2 = width / 2 - 60;

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
  },
  rowText: {
    fontSize: 18,
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
  },
  seeAll: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 18,
    color: colors.textColor,
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
  const { connectedAddress } = useAuthState();
  const voterProfile = profiles[vote.voter];
  let voterName =
    voterProfile && voterProfile.ens ? voterProfile.ens : shorten(vote.voter);
  if (connectedAddress === vote.voter) {
    voterName = i18n.t("you");
  }
  const blockie = makeBlockie(vote.voter);
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar
            symbolIndex="space"
            size={20}
            space={space}
            initialBlockie={blockie}
          />
          <Text
            style={[
              styles.rowText,
              {
                marginLeft: 6,
                width: isQuadraticOrRankedChoice
                  ? contentWidth3
                  : contentWidth2,
              },
            ]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {voterName}
          </Text>
        </View>
        {isQuadraticOrRankedChoice && (
          <Text
            style={[
              styles.rowText,
              { textAlign: "center", width: contentWidth3 },
            ]}
            ellipsizeMode="clip"
          >
            {shorten(getChoiceString(proposal, vote.choice), 24)}
          </Text>
        )}
        <View style={{ flexDirection: "row" }}>
          <Text
            style={[
              styles.rowText,
              {
                textAlign: "right",
                marginRight: 8,
                width: isQuadraticOrRankedChoice
                  ? contentWidth3
                  : contentWidth2,
              },
            ]}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {n(vote.balance)} {space.symbol}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
}

export default React.memo(VoteRow);
