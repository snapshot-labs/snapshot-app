import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
} from "react-native";
import colors from "constants/colors";
import common from "styles/common";
import { useNavigation } from "@react-navigation/native";
import { PROPOSAL_SCREEN } from "constants/navigation";
import { useAuthState } from "context/authContext";
import { Proposal } from "types/proposal";
import { useExploreState } from "context/exploreContext";
import { getTimeAgoProposalNotification } from "helpers/proposalUtils";
import { getUsername } from "helpers/profile";
import i18n from "i18n-js";
import SpaceAvatar from "components/SpaceAvatar";

const isIOS = Platform.OS === "ios";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryText: {
    fontFamily: "Calibre-Medium",
    color: colors.darkGray,
    fontSize: 18,
  },
  authorContainer: {
    flexDirection: "row",
    marginRight: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  headerAuthor: {
    color: colors.darkGray,
    fontSize: 18,
    marginLeft: 8,
    fontFamily: "Calibre-Medium",
    lineHeight: 24,
    marginTop: Platform.OS === "ios" ? 4 : 0,
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
  const { profiles } = useExploreState();

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.push(PROPOSAL_SCREEN, {
          proposal,
        });
      }}
    >
      <View
        style={[
          styles.container,
          {
            borderBottomColor: colors.borderColor,
            backgroundColor: didView
              ? colors.bgDefault
              : colors.categoriesBgColor,
          },
        ]}
      >
        <View style={styles.authorContainer}>
          <SpaceAvatar symbolIndex="space" size={24} space={proposal?.space} />
          <Text
            style={styles.headerAuthor}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {i18n.t("spaceProposal", { space: proposal?.space?.name })}{" "}
            {getTimeAgoProposalNotification(time, event)}
          </Text>
        </View>
        <View style={styles.titleContainer}>
          <Text
            style={[
              common.h4,
              { marginTop: isIOS ? 4 : 0, color: colors.textColor },
            ]}
          >
            {proposal?.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default ProposalNotification;
