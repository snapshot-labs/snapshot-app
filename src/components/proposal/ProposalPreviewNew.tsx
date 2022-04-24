import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Share,
} from "react-native";
import { useAuthDispatch, useAuthState } from "context/authContext";
import { Proposal } from "types/proposal";
import common from "styles/common";
import SpaceAvatar from "components/SpaceAvatar";
import { getUsername, getUserProfile } from "helpers/profile";
import { useExploreState } from "context/exploreContext";
import i18n from "i18n-js";
import { n } from "helpers/miscUtils";
import IconFont from "components/IconFont";
import ProposalState from "components/proposal/ProposalState";
import { STATES } from "constants/proposal";
import get from "lodash/get";
import isNaN from "lodash/isNaN";
import * as Progress from "react-native-progress";
import { CREATE_PROPOSAL_SCREEN, PROPOSAL_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/core";
import ProposalVoteButton from "components/proposal/ProposalVoteButton";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import {getProposalUrl, getStartText} from "helpers/proposalUtils";
import { deleteProposal, isAdmin } from "helpers/apiUtils";
import { useEngineState } from "context/engineContext";
import { useToastShowConfig } from "constants/toast";
import ProposalPreviewWinningChoiceText from "components/proposal/preview/ProposalPreviewWinningChoiceText";

const styles = StyleSheet.create({
  proposalPreviewContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  authorContainer: {
    marginLeft: 9,
  },
  authorText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
  },
  startedText: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
  proposalTitle: {
    fontSize: 22,
    fontFamily: "Calibre-Medium",
  },
  proposalTitleContainer: {
    marginTop: 22,
    paddingBottom: 22,
    borderBottomWidth: 1,
    marginBottom: 14,
  },
  actionsContainer: {},
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
  voteAmountText: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: 4,
  },
  viewOtherResultButton: {
    marginTop: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 9,
  },
  viewOtherResultText: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
});

interface ProposalPreview {
  proposal: Proposal;
}

function ProposalPreview({ proposal }: ProposalPreview) {
  const navigation: any = useNavigation();
  const { colors, connectedAddress, wcConnector, snapshotWallets } =
    useAuthState();
  const { profiles, spaces } = useExploreState();
  const { keyRingController, typedMessageManager } = useEngineState();
  const authDispatch = useAuthDispatch();
  const authorProfile = getUserProfile(proposal.author, profiles);
  const authorName = getUsername(
    proposal.author,
    authorProfile,
    connectedAddress
  );
  const toastShowConfig = useToastShowConfig();
  const startText = getStartText(proposal.start);
  const winningChoiceIndex = useMemo(
    () => proposal?.scores?.indexOf(Math.max(...proposal.scores)),
    [proposal]
  );
  const scoresTotal = proposal.scores_total;
  const currentScore: any = get(
    proposal?.scores,
    winningChoiceIndex,
    undefined
  );
  const winningChoiceTitle = get(proposal.choices, winningChoiceIndex, "");
  const isClosed = proposal.state === STATES.closed;
  const spaceDetails = Object.assign(
    proposal.space,
    get(spaces, proposal.space?.id ?? "", {})
  );
  const calculatedScore = (1 / scoresTotal) * currentScore;
  const formattedCalculatedScore = n(calculatedScore, "0.[0]%");
  const voteAmount = `${n(currentScore)} ${proposal?.space?.symbol}`;
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
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.push(PROPOSAL_SCREEN, { proposal });
      }}
    >
      <View
        style={[
          styles.proposalPreviewContainer,
          { borderColor: colors.borderColor },
        ]}
      >
        <View style={common.row}>
          <SpaceAvatar size={35} space={proposal.space} symbolIndex="space" />
          <View style={styles.authorContainer}>
            <View style={common.row}>
              <View style={[common.row, common.alignItemsCenter]}>
                <Text style={[styles.authorText, { color: colors.textColor }]}>
                  {proposal?.space?.name}
                </Text>
                <Text
                  style={[styles.authorText, { color: colors.secondaryGray }]}
                >
                  {` ${i18n.t("by")} `}
                </Text>
                <Text style={[styles.authorText, { color: colors.textColor }]}>
                  {authorName}
                </Text>
              </View>
            </View>
            <Text style={[styles.startedText, { color: colors.secondaryGray }]}>
              {startText}
            </Text>
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
                        space: spaceDetails,
                      });
                    } else if (
                      (isAdmin(connectedAddress ?? "", spaceDetails) ||
                        connectedAddress?.toLowerCase() ===
                          proposal?.author?.toLowerCase()) &&
                      index === 1
                    ) {
                      deleteProposal(
                        wcConnector,
                        connectedAddress ?? "",
                        spaceDetails,
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
        <View
          style={[
            styles.proposalTitleContainer,
            { borderBottomColor: colors.borderColor },
          ]}
        >
          <Text style={[styles.proposalTitle, { color: colors.textColor }]}>
            {proposal?.title}
          </Text>
          {isClosed && !isNaN(calculatedScore) && (
            <View>
              <ProposalPreviewWinningChoiceText
                winningChoiceTitle={winningChoiceTitle}
                voteAmount={voteAmount}
                formattedCalculatedScore={formattedCalculatedScore}
              />
              <Progress.Bar
                progress={calculatedScore}
                color={colors.bgBlue}
                unfilledColor={colors.borderColor}
                width={null}
                borderColor="transparent"
                height={4}
              />
              <View
                style={[
                  styles.viewOtherResultButton,
                  { borderColor: colors.borderColor },
                ]}
              >
                <Text
                  style={[
                    styles.viewOtherResultText,
                    { color: colors.textColor },
                  ]}
                >
                  {i18n.t("viewOtherResults")}
                </Text>
              </View>
            </View>
          )}
        </View>
        <View
          style={[common.row, common.alignItemsCenter, styles.actionsContainer]}
        >
          <ProposalVoteButton
            proposal={proposal}
            space={proposal.space}
            getProposal={() => {}}
            title={isClosed ? `${n(proposal.votes)}` : i18n.t("vote")}
            buttonContainerStyle={{
              paddingVertical: 9,
              paddingHorizontal: 20,
            }}
            buttonTitleStyle={isClosed ? { color: colors.blueButtonBg } : {}}
            disabled={isClosed}
            voteContainerStyle={{ marginHorizontal: 0, bottom: 0 }}
            Icon={
              isClosed
                ? () => (
                    <IconFont
                      name={"signature"}
                      size={14}
                      color={colors.blueButtonBg}
                      style={{ marginRight: 6 }}
                    />
                  )
                : undefined
            }
          />
          <TouchableWithoutFeedback
            onPress={async () => {
              try {
                await Share.share({
                  url: getProposalUrl(proposal, spaceDetails),
                  message: getProposalUrl(proposal, spaceDetails),
                });
              } catch (error) {
                console.log("SHARE ERROR", error);
              }
            }}
          >
            <View>
              <IconFont
                name={"upload"}
                size={20}
                color={colors.textColor}
                style={{ marginLeft: 20 }}
              />
            </View>
          </TouchableWithoutFeedback>
          <View style={common.marginLeftAuto}>
            <ProposalState proposal={proposal} />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default ProposalPreview;
