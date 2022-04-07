import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
  Dimensions,
  Platform,
  TouchableOpacity,
  Share,
} from "react-native";
import colors from "constants/colors";
import { Proposal } from "types/proposal";
import { shorten, toNow } from "helpers/miscUtils";
import { useNavigation } from "@react-navigation/native";
import { CREATE_PROPOSAL_SCREEN, PROPOSAL_SCREEN } from "constants/navigation";
import removeMd from "remove-markdown";
import i18n from "i18n-js";
import { useExploreState } from "context/exploreContext";
import { Space } from "types/explore";
import { getUsername } from "helpers/profile";
import isEmpty from "lodash/isEmpty";
import { useAuthDispatch, useAuthState } from "context/authContext";
import SpaceAvatar from "./SpaceAvatar";
import CoreBadge from "./CoreBadge";
import StateBadge from "./StateBadge";
import ProposalPreviewFinalScores from "./ProposalPreviewFinalScores";
import IconFont from "components/IconFont";
import { getTimeAgo } from "helpers/proposalUtils";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { deleteProposal, isAdmin } from "helpers/apiUtils";
import { getProposalUrl } from "helpers/proposalUtils";
import { useToastShowConfig } from "constants/toast";
import { useEngineState } from "context/engineContext";
import Device from "helpers/device";

const { width } = Dimensions.get("screen");

const previewPadding = 16;
const avatarSize = 28;
const stateBadgeMaxWidth = 80;
const coreWidth = 46;
const defaultAuthorTextWidth =
  width - 2 * previewPadding - avatarSize - stateBadgeMaxWidth - 8;

const styles = StyleSheet.create({
  proposalPreviewContainer: {
    borderColor: colors.borderColor,
    borderBottomWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: previewPadding,
  },
  header: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  avatar: {
    width: avatarSize,
    height: avatarSize,
    borderRadius: 14,
  },
  headerAuthor: {
    color: colors.darkGray,
    fontSize: 18,
    marginLeft: 8,
    fontFamily: "Calibre-Medium",
    lineHeight: 28,
    marginTop: Platform.OS === "ios" ? 4 : 0,
  },
  authorContainer: {
    flexDirection: "row",
    width: defaultAuthorTextWidth,
    marginRight: 10,
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
  },
  title: {
    color: colors.headingColor,
    fontFamily: "Calibre-Semibold",
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 8,
  },
  body: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
    marginBottom: 16,
    lineHeight: 30,
  },
  period: {
    fontSize: 18,
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
  },
  dayStartedEnded: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginTop: 20,
  },
});

function getPeriod(
  state: string,
  start: number,
  end: number,
  proposal: Proposal
) {
  if (state === "closed") {
    return i18n.t("countVotes", { votes: proposal.votes });
  } else if (state === "active") {
    return i18n.t("endLeft", { timeAgo: toNow(end) });
  }
  return i18n.t("startIn", { timeAgo: toNow(start) });
}

interface ProposalPreviewProps {
  proposal: Proposal;
  space: Space;
}

function ProposalPreview({ proposal, space }: ProposalPreviewProps) {
  const navigation: any = useNavigation();
  const { connectedAddress, colors, wcConnector, snapshotWallets } =
    useAuthState();
  const { keyRingController, typedMessageManager } = useEngineState();
  const authDispatch = useAuthDispatch();
  const toastShowConfig = useToastShowConfig();
  const { profiles } = useExploreState();
  const formattedBody = useMemo(
    () => shorten(removeMd(proposal.body), 140).replace(/\r?\n|\r/g, " "),
    [proposal]
  );
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const title = useMemo(() => shorten(proposal.title, 124), [proposal]);
  const period = useMemo(
    () => getPeriod(proposal.state, proposal.start, proposal.end, proposal),
    [proposal]
  );
  const authorProfile = profiles[proposal.author];
  const authorName = getUsername(
    proposal.author,
    authorProfile,
    connectedAddress ?? ""
  );
  const isCore = useMemo(() => {
    if (isEmpty(space?.members)) return false;
    let updatedMembers = space.members.map((address: string) =>
      address.toLowerCase()
    );
    return updatedMembers.includes(proposal.author.toLowerCase());
  }, [proposal, space]);
  const options = useMemo(() => {
    const setOptions = [i18n.t("share"), i18n.t("duplicateProposal")];
    if (
      isAdmin(connectedAddress ?? "", space) ||
      connectedAddress?.toLowerCase() === proposal?.author?.toLowerCase()
    ) {
      setOptions.push(i18n.t("deleteProposal"));
    }
    return setOptions;
  }, [proposal, space]);

  return (
    <TouchableHighlight
      underlayColor={colors.highlightColor}
      onPress={() => {
        navigation.push(PROPOSAL_SCREEN, { proposal });
      }}
    >
      <View
        style={[
          styles.proposalPreviewContainer,
          {
            borderColor: colors.borderColor,
            backgroundColor: colors.bgDefault,
          },
        ]}
      >
        <View style={styles.header}>
          <SpaceAvatar symbolIndex="space" size={28} space={proposal.space} />
          <View
            style={[
              styles.authorContainer,
              {
                width: isCore
                  ? defaultAuthorTextWidth - coreWidth
                  : defaultAuthorTextWidth,
                marginBottom: Device.isIos() ? 4 : 0,
              },
            ]}
          >
            <Text
              style={styles.headerAuthor}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {proposal.space.name} by {authorName}
            </Text>
            <CoreBadge
              address={proposal.author}
              members={space?.members}
              key={proposal.id}
            />
          </View>
          <TouchableOpacity
            hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
            onPress={() => {
              const snapPoints = [10, options.length > 2 ? 300 : 200];
              const destructiveButtonIndex = 2;
              bottomSheetModalDispatch({
                type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                payload: {
                  options: options,
                  snapPoints: snapPoints,
                  show: true,
                  initialIndex: 1,
                  destructiveButtonIndex,
                  key: proposal.id,
                  icons: [
                    { name: "upload", size: 22 },
                    { name: "external-link" },
                    { name: "close" },
                  ],
                  onPressOption: async (index: number) => {
                    if (index === 0) {
                      try {
                        await Share.share({
                          url: getProposalUrl(proposal, space),
                          message: getProposalUrl(proposal, space),
                        });
                      } catch (error) {
                        console.log("SHARE ERROR", error);
                      }
                    } else if (index === 1) {
                      navigation.navigate(CREATE_PROPOSAL_SCREEN, {
                        proposal,
                        space,
                      });
                    } else if (
                      (isAdmin(connectedAddress ?? "", space) ||
                        connectedAddress?.toLowerCase() ===
                          proposal?.author?.toLowerCase()) &&
                      index === 2
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
            style={{ marginLeft: "auto" }}
          >
            <IconFont name="more" size={32} color={colors.textColor} />
          </TouchableOpacity>
        </View>
        <View>
          <Text
            style={[
              styles.title,
              {
                color: colors.textColor,
                marginBottom: isEmpty(formattedBody) ? 16 : 8,
              },
            ]}
          >
            {title}
          </Text>
          {!isEmpty(formattedBody) && (
            <Text style={[styles.body, { color: colors.secondaryTextColor }]}>
              {formattedBody}
            </Text>
          )}
        </View>
        {proposal.scores_state === "final" &&
          proposal.votes > 0 &&
          proposal.choices?.length <= 6 && (
            <View style={{ marginBottom: 20 }}>
              <ProposalPreviewFinalScores proposal={proposal} />
            </View>
          )}
        <View style={styles.statusContainer}>
          <StateBadge state={proposal.state} />
          <Text style={[styles.period, { color: colors.secondaryTextColor }]}>
            , {period}
          </Text>
        </View>
        <View>
          <Text
            style={[
              styles.dayStartedEnded,
              { color: colors.secondaryTextColor },
            ]}
          >
            {getTimeAgo(proposal)}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
}

export default ProposalPreview;
