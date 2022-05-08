import React, { useMemo } from "react";
import {
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import common from "styles/common";
import {
  CREATE_PROPOSAL_SCREEN,
  SPACE_SCREEN,
  USER_PROFILE,
} from "constants/navigation";
import SpaceAvatar from "components/SpaceAvatar";
import i18n from "i18n-js";
import ProposalState from "components/proposal/ProposalState";
import IconButton from "components/IconButton";
import { getProposalUrl } from "helpers/proposalUtils";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { deleteProposal, isAdmin } from "helpers/apiUtils";
import { useAuthDispatch, useAuthState } from "context/authContext";
import { useNavigation } from "@react-navigation/core";
import { Space } from "types/explore";
import { Proposal } from "types/proposal";
import { useEngineState } from "context/engineContext";
import { useExploreState } from "context/exploreContext";
import { getUsername, getUserProfile } from "helpers/profile";
import { useToastShowConfig } from "constants/toast";
import Device from "helpers/device";

const styles = StyleSheet.create({
  proposalTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 28,
    lineHeight: 28,
  },
  proposalHeader: {
    paddingHorizontal: 14,
    paddingTop: Device.isIos() ? 70 : 20,
  },
  authorTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
  },
  proposalAuthorSpaceContainer: {
    flexDirection: "row",
    marginTop: 22,
    marginBottom: 11,
    alignItems: "center",
    marginRight: 16,
    width: "60%",
  },
});

interface ProposalScreenHeaderProps {
  space: Space;
  proposal: Proposal;
}

function ProposalScreenHeader({ space, proposal }: ProposalScreenHeaderProps) {
  const navigation: any = useNavigation();
  const { colors, connectedAddress, wcConnector, snapshotWallets } =
    useAuthState();
  const { keyRingController, typedMessageManager } = useEngineState();
  const { profiles } = useExploreState();
  const authorProfile = getUserProfile(proposal.author, profiles);
  const authorName = getUsername(
    proposal.author,
    authorProfile,
    connectedAddress ?? ""
  );
  const authDispatch = useAuthDispatch();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const menuOptions = useMemo(() => {
    const setOptions = [i18n.t("duplicateProposal")];
    if (
      isAdmin(connectedAddress ?? "", space) ||
      connectedAddress?.toLowerCase() === proposal?.author?.toLowerCase()
    ) {
      setOptions.push(i18n.t("deleteProposal"));
    }
    return setOptions;
  }, [proposal, space]);
  const toastShowConfig = useToastShowConfig();
  const bottomSheetModalRef = useBottomSheetModalRef();

  return (
    <View
      style={[styles.proposalHeader, { backgroundColor: colors.bgDefault }]}
    >
      <Text style={[styles.proposalTitle, { color: colors.textColor }]}>
        {proposal.title}
      </Text>
      <View style={[common.row, common.alignItemsCenter]}>
        <View>
          <View style={styles.proposalAuthorSpaceContainer}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(SPACE_SCREEN, {
                  space,
                  showHeader: true,
                });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <SpaceAvatar symbolIndex="space" size={18} space={space} />
                <Text
                  style={[
                    styles.authorTitle,
                    {
                      color: colors.textColor,
                      marginLeft: 8,
                    },
                  ]}
                >
                  {proposal?.space?.name}
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={[styles.authorTitle, { color: colors.secondaryGray }]}>
              {`  ${i18n.t("by")} `}
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.push(USER_PROFILE, {
                  address: proposal?.author,
                });
              }}
            >
              <Text
                style={[
                  styles.authorTitle,
                  {
                    color: colors.textColor,
                  },
                ]}
              >
                {authorName}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ alignSelf: "flex-start" }}>
            <ProposalState proposal={proposal} />
          </View>
        </View>
        <View
          style={[
            common.row,
            common.marginLeftAuto,
            common.containerHorizontalPadding,
          ]}
        >
          <IconButton
            onPress={async () => {
              try {
                await Share.share({
                  url: getProposalUrl(proposal, space),
                  message:
                    proposal.title + Platform.OS === "android"
                      ? ` ${getProposalUrl(proposal, space)}`
                      : "",
                });
              } catch (error) {}
            }}
            name="upload"
          />
          <View style={{ width: 4, height: 5 }} />
          <IconButton
            onPress={() => {
              const snapPoints = [10, menuOptions.length > 1 ? 150 : 130];
              const destructiveButtonIndex = 1;
              bottomSheetModalDispatch({
                type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                payload: {
                  options: menuOptions,
                  snapPoints,
                  show: true,
                  key: `proposal-menu-${proposal.id}`,
                  icons: [{ name: "external-link" }, { name: "close" }],
                  initialIndex: 1,
                  destructiveButtonIndex,
                  onPressOption: async (index: number) => {
                    if (index === 0) {
                      try {
                        await Share.share({
                          url: getProposalUrl(proposal, space),
                          message:
                            proposal.title + Platform.OS === "android"
                              ? ` ${getProposalUrl(proposal, space)}`
                              : "",
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
            name={"threedots"}
          />
        </View>
      </View>
    </View>
  );
}

export default ProposalScreenHeader;
