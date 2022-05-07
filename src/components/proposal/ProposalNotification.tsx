import React from "react";
import { StyleSheet, View, Text, TouchableWithoutFeedback } from "react-native";
import colors from "constants/colors";
import { useNavigation } from "@react-navigation/native";
import { PROPOSAL_SCREEN } from "constants/navigation";
import { useAuthState } from "context/authContext";
import { Proposal } from "types/proposal";
import { getTimeAgoProposalNotification } from "helpers/proposalUtils";
import i18n from "i18n-js";
import Device from "helpers/device";
import SpaceAvatar from "components/SpaceAvatar";

const deviceWidth = Device.getDeviceWidth();
const leftMargin = 14;
const rightMargin = 4;
const viewCircleDimensions = 12;
const spaceAvatarSize = 44;
const proposalAuthorTitleContainerMargin = 18;

const styles = StyleSheet.create({
  container: {
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
    flexDirection: "row",
    marginLeft: leftMargin,
    marginRight: rightMargin,
    paddingVertical: 18,
  },
  titleContainer: {
    marginTop: 6,
    flexWrap: "wrap",
    width: "100%",
  },
  secondaryText: {
    fontFamily: "Calibre-Medium",
    color: colors.darkGray,
    fontSize: 18,
  },
  authorContainer: {
    flexDirection: "row",
    marginRight: 10,
  },
  headerAuthor: {
    color: colors.secondaryGray,
    fontSize: 14,
    fontFamily: "Calibre-Medium",
  },
  title: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
    flexWrap: "wrap",
    width:
      deviceWidth -
      leftMargin -
      rightMargin -
      spaceAvatarSize -
      proposalAuthorTitleContainerMargin -
      30,
  },
  proposalAuthorTitleContainer: {
    marginLeft: proposalAuthorTitleContainerMargin,
  },
  viewCircle: {
    height: viewCircleDimensions,
    width: viewCircleDimensions,
    borderRadius: viewCircleDimensions / 2,
    marginRight: 18,
    alignSelf: "center",
    position: "absolute",
    bottom: -2,
    right: -16,
  },
  spaceAvatarContainer: {
    alignSelf: "center",
  },
});

interface ProposalNotificationProps {
  proposal: Proposal;
  didView: boolean;
  event: string;
  time: number;
}

function ProposalNotification({
  proposal,
  didView,
  event,
  time,
}: ProposalNotificationProps) {
  const navigation: any = useNavigation();
  const { colors } = useAuthState();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.push(PROPOSAL_SCREEN, {
          proposal,
        });
      }}
    >
      <View
        style={[styles.container, { borderBottomColor: colors.borderColor }]}
      >
        <View style={styles.authorContainer}>
          <View
            style={[
              styles.viewCircle,
              {
                backgroundColor: didView ? "transparent" : colors.blueButtonBg,
              },
            ]}
          />
          <View style={styles.spaceAvatarContainer}>
            <SpaceAvatar
              symbolIndex="space"
              size={spaceAvatarSize}
              space={proposal?.space}
            />
            <View
              style={[
                styles.viewCircle,
                {
                  backgroundColor: didView ? "transparent" : colors.baseRed,
                },
              ]}
            />
          </View>
          <View style={styles.proposalAuthorTitleContainer}>
            <Text
              style={styles.headerAuthor}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {i18n.t("spaceProposal", { space: proposal?.space?.name })}{" "}
              {getTimeAgoProposalNotification(time, event)}
            </Text>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.textColor }]}>
                {proposal?.title}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default ProposalNotification;
