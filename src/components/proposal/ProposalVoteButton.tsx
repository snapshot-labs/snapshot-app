import React from "react";
import { View, StyleSheet, Text, ViewStyle, TextStyle } from "react-native";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";
import { useNavigation } from "@react-navigation/native";
import { VOTE_SCREEN } from "constants/navigation";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";
import Button from "components/Button";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import CastVoteModal from "components/snapshot/CastVoteModal";
import Device from "helpers/device";

const styles = StyleSheet.create({
  voteContainer: {
    marginHorizontal: 16,
    bottom: 30,
    backgroundColor: "transparent",
  },
  castVoteTitle: {
    marginTop: 16,
    fontSize: 22,
    fontFamily: "Calibre-Semibold",
    textAlign: "center",
  },
  castVoteSubtitle: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    textAlign: "center",
    marginTop: 9,
  },
});

interface ProposalVoteButtonProps {
  proposal: Proposal;
  space: Space;
  getProposal: () => void;
  title?: string;
  disabled?: boolean;
  buttonContainerStyle?: ViewStyle;
  voteContainerStyle?: ViewStyle;
  buttonTitleStyle?: TextStyle;
  Icon?: React.FC | undefined;
  onPress?: () => void;
}

function ProposalVoteButton({
  proposal,
  space,
  getProposal,
  title = i18n.t("castVote"),
  disabled = false,
  buttonContainerStyle = {},
  voteContainerStyle,
  buttonTitleStyle = {},
  Icon = undefined,
  onPress = undefined,
}: ProposalVoteButtonProps) {
  const { colors } = useAuthState();
  const navigation: any = useNavigation();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();

  return (
    <View style={[styles.voteContainer, voteContainerStyle]}>
      <Button
        onPress={
          onPress
            ? onPress
            : () => {
                const choicesLength = proposal?.choices?.length ?? 0;
                const maxSnapPoint = choicesLength * 59 + 260;
                const snapPoint =
                  maxSnapPoint > Device.getDeviceHeight()
                    ? "100%"
                    : maxSnapPoint;
                bottomSheetModalDispatch({
                  type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                  payload: {
                    TitleComponent: () => {
                      return (
                        <View>
                          <Text
                            style={[
                              styles.castVoteTitle,
                              { color: colors.textColor },
                            ]}
                          >
                            {i18n.t("castYourVote")}
                          </Text>
                          <Text
                            style={[
                              styles.castVoteSubtitle,
                              { color: colors.secondaryGray },
                            ]}
                          >
                            {i18n.t("selectOptionAndConfirmVote")}
                          </Text>
                        </View>
                      );
                    },
                    ModalContent: () => {
                      return (
                        <CastVoteModal
                          proposal={proposal}
                          space={space}
                          getProposal={() => {
                            getProposal();
                            bottomSheetModalRef?.current?.close();
                          }}
                          navigation={navigation}
                        />
                      );
                    },
                    options: [],
                    snapPoints: [10, snapPoint, "95%"],
                    show: true,
                    scroll: true,
                    icons: [],
                    initialIndex: 1,
                    destructiveButtonIndex: -1,
                    key: `snapshot-screen-vote-proposal-${proposal.id}`,
                  },
                });
              }
        }
        title={title}
        primary
        disabled={disabled}
        buttonContainerStyle={buttonContainerStyle}
        Icon={Icon}
        buttonTitleStyle={buttonTitleStyle}
      />
    </View>
  );
}

export default ProposalVoteButton;
