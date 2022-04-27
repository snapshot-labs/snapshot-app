import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
import SpaceAvatar from "components/SpaceAvatar";
import { useAuthDispatch, useAuthState } from "context/authContext";
import * as Progress from "react-native-progress";
import get from "lodash/get";
import { n } from "helpers/miscUtils";
import isEmpty from "lodash/isEmpty";
import i18n from "i18n-js";
import { CREATE_PROPOSAL_SCREEN, PROPOSAL_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/core";
import { Space } from "types/explore";
import { Proposal } from "types/proposal";
import Device from "helpers/device";
import IconFont from "components/IconFont";
import common from "styles/common";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { deleteProposal, isAdmin } from "helpers/apiUtils";
import { getUsername, getUserProfile } from "helpers/profile";
import { useExploreState } from "context/exploreContext";
import { getStartText } from "helpers/proposalUtils";
import { useToastShowConfig } from "constants/toast";
import { useEngineState } from "context/engineContext";
import ProposalState from "components/proposal/ProposalState";

const width = Device.getDeviceWidth() - 60;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentVotedProposalPreviewContainer: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginLeft: 14,
    marginTop: 16,
    marginBottom: 16,
    width,
  },
  proposalTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
    marginRight: 24,
  },
  viewProposalClosedText: {
    fontSize: 14,
    fontFamily: "Calibre-Semibold",
    textTransform: "uppercase",
    marginBottom: Device.isIos() ? 10 : 0,
  },
  proposalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    marginTop: 22,
  },
  viewProposalContainer: {
    paddingVertical: 8,
    borderRadius: 30,
    paddingHorizontal: 16,
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  viewProposal: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
  winningResultText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  winningResultTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 18,
  },
  winningTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
  },
  winningTitleContainer: {
    marginTop: 16,
  },
  authorContainer: {
    marginLeft: 9,
  },
  spaceText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  authorText: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
  startedText: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
  votedForText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
  },
});

interface RecentVotedProposalsPreviewProps {
  space: Space;
  proposal: Proposal;
  choice: number;
}

function RecentVotedProposalPreview({
  space,
  proposal,
  choice,
}: RecentVotedProposalsPreviewProps) {
  const { colors, connectedAddress, wcConnector, snapshotWallets } =
    useAuthState();
  const winningChoiceIndex = useMemo(
    () => proposal?.scores?.indexOf(Math.max(...proposal.scores)),
    [proposal]
  );
  const options = useMemo(() => {
    const setOptions = [i18n.t("duplicateProposal")];
    if (
      isAdmin(connectedAddress ?? "", proposal.space) ||
      connectedAddress?.toLowerCase() === proposal?.author?.toLowerCase()
    ) {
      setOptions.push(i18n.t("deleteProposal"));
    }
    return setOptions;
  }, [proposal]);
  const { keyRingController, typedMessageManager } = useEngineState();
  const winningChoiceTitle = get(proposal.choices, winningChoiceIndex, "");
  const scoresTotal = proposal.scores_total;
  const currentScore: any = get(
    proposal?.scores,
    winningChoiceIndex,
    undefined
  );
  const { profiles } = useExploreState();
  const authorProfile = getUserProfile(proposal.author, profiles);
  const calculatedScore = (1 / scoresTotal) * currentScore;
  const formattedCalculatedScore = n(calculatedScore, "0.[0]%");
  const navigation: any = useNavigation();
  const authorName = getUsername(
    proposal.author,
    authorProfile,
    connectedAddress
  );
  const authDispatch = useAuthDispatch();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const startText = getStartText(proposal.start);
  const toastShowConfig = useToastShowConfig();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const userChoice = get(proposal.choices, choice, undefined);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.push(PROPOSAL_SCREEN, { proposal });
      }}
    >
      <View
        style={[
          styles.recentVotedProposalPreviewContainer,
          { borderColor: colors.borderColor },
        ]}
      >
        <View style={common.row}>
          <SpaceAvatar size={35} space={proposal.space} symbolIndex="space" />
          <View style={styles.authorContainer}>
            <View style={common.row}>
              <View style={[common.row, common.alignItemsCenter]}>
                <Text style={[styles.spaceText, { color: colors.textColor }]}>
                  {proposal?.space?.name}
                </Text>
              </View>
            </View>
            <View style={common.row}>
              <Text
                style={[styles.authorText, { color: colors.secondaryGray }]}
              >
                {`${i18n.t("by")} `}
              </Text>
              <Text
                style={[styles.authorText, { color: colors.secondaryGray }]}
              >
                {`${authorName} • `}
              </Text>
              <Text
                style={[styles.startedText, { color: colors.secondaryGray }]}
              >
                {startText}
              </Text>
            </View>
          </View>
          <TouchableWithoutFeedback
            onPress={() => {
              const snapPoints = [10, options.length > 1 ? 150 : 130];
              const destructiveButtonIndex = 1;
              bottomSheetModalDispatch({
                type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                payload: {
                  options: options,
                  snapPoints: snapPoints,
                  show: true,
                  initialIndex: 1,
                  destructiveButtonIndex,
                  key: proposal.id,
                  icons: [{ name: "external-link" }, { name: "close" }],
                  onPressOption: async (index: number) => {
                    if (index === 0) {
                      navigation.navigate(CREATE_PROPOSAL_SCREEN, {
                        proposal,
                        space,
                      });
                    } else if (
                      (isAdmin(connectedAddress ?? "", space) ||
                        connectedAddress?.toLowerCase() ===
                          proposal?.author?.toLowerCase()) &&
                      index === 1
                    ) {
                      deleteProposal(
                        wcConnector,
                        connectedAddress ?? "",
                        space,
                        proposal,
                        authDispatch,
                        toastShowConfig,
                        navigation,
                        snapshotWallets,
                        keyRingController,
                        typedMessageManager,
                        bottomSheetModalDispatch,
                        bottomSheetModalRef
                      );
                    }
                    bottomSheetModalRef.current.close();
                  },
                },
              });
            }}
          >
            <View style={common.marginLeftAuto}>
              <IconFont name={"threedots"} size={18} color={colors.textColor} />
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.proposalTitleContainer}>
          <Text
            style={[styles.proposalTitle, { color: colors.textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {proposal.title}
          </Text>
        </View>
        <View>
          <View style={styles.winningResultTextContainer}>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  backgroundColor: "rgba(249, 187, 96, 0.3)",
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                  marginRight: 4,
                  borderRadius: 6,
                }}
              >
                <IconFont name="signature" size={12} color={"#F7A426"} />
              </View>
              <Text
                style={[styles.winningResultText, { color: colors.textColor }]}
              >
                {winningChoiceTitle}
              </Text>
            </View>
            <Text
              style={[styles.winningResultText, { color: colors.textColor }]}
            >
              {formattedCalculatedScore}
            </Text>
          </View>
          <Progress.Bar
            progress={calculatedScore}
            color={colors.bgBlue}
            unfilledColor={colors.borderColor}
            width={null}
            borderColor="transparent"
            height={4}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 16,
          }}
        >
          {!isEmpty(userChoice) && (
            <View
              style={[common.row, common.alignItemsCenter, { marginRight: 16 }]}
            >
              <Text
                style={[styles.votedForText, { color: colors.blueButtonBg }]}
              >
                {i18n.t("you")}
              </Text>
              <Text
                style={[
                  styles.votedForText,
                  common.textLowercase,
                  { color: colors.secondaryGray },
                ]}
              >
                {` ${i18n.t("voted")} `}
              </Text>
              <Text style={[styles.votedForText, { color: colors.textColor }]}>
                "{userChoice}"
              </Text>
            </View>
          )}
          <View style={common.marginLeftAuto}>
            <ProposalState proposal={proposal} />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default RecentVotedProposalPreview;
