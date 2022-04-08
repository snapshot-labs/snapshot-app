import React from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import UserAvatar from "../UserAvatar";
import { getChoiceString, n } from "helpers/miscUtils";
import i18n from "i18n-js";
import colors from "constants/colors";
import { Space } from "types/explore";
import { Proposal } from "types/proposal";
import { useAuthState } from "context/authContext";
import { getUsername, getUserProfile } from "helpers/profile";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import ReceiptModal from "components/proposal/ReceiptModal";
import IconFont from "components/IconFont";
import { USER_PROFILE } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";

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

interface VoteRowProps {
  vote: any;
  profiles: any;
  space: Space;
  proposal: Proposal;
}

function VoteRow({ vote, profiles, space, proposal }: VoteRowProps) {
  const { connectedAddress, colors } = useAuthState();
  const voterProfile = getUserProfile(vote.voter, profiles);
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const navigation: any = useNavigation();
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
        navigation.push(USER_PROFILE, { address: vote.voter });
      }}
      underlayColor={colors.highlightColor}
    >
      <View
        key={vote.id}
        style={[styles.row, { borderBottomColor: colors.borderColor }]}
      >
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
            {n(vote.balance)} {space?.symbol ?? proposal?.space?.symbol}
          </Text>
          <TouchableOpacity
            onPress={() => {
              bottomSheetModalDispatch({
                type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                payload: {
                  options: [],
                  snapPoints: [10, 300],
                  show: true,
                  initialIndex: 1,
                  ModalContent: () => (
                    <ReceiptModal
                      onClose={() => {
                        bottomSheetModalRef?.current?.close();
                      }}
                      authorIpfsHash={vote.id}
                    />
                  ),
                },
              });
            }}
          >
            <IconFont name="signature" size={20} color={colors.textColor} />
          </TouchableOpacity>
        </View>
        {isQuadraticOrRankedChoice && (
          <Text
            style={[styles.rowText, { marginTop: 8, color: colors.textColor }]}
            ellipsizeMode="clip"
          >
            {getChoiceString(proposal, vote.choice)}
          </Text>
        )}
      </View>
    </TouchableHighlight>
  );
}

export default React.memo(VoteRow);
