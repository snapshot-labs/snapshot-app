import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import IconFont from "../IconFont";
import { Space } from "../../types/explore";
import { useActionSheet } from "@expo/react-native-action-sheet";
import i18n from "i18n-js";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../../context/authContext";
import common, { actionSheetTextStyles } from "../../styles/common";
import { Proposal } from "../../types/proposal";
import { useNavigation } from "@react-navigation/native";
import client from "../../helpers/snapshotClient";
import Toast from "react-native-toast-message";
import { CREATE_PROPOSAL_SCREEN } from "../../constants/navigation";
import { useToastShowConfig } from "../../constants/toast";

const isAdmin = (connectedAddress: string, space: Space) => {
  const admins = (space.admins || []).map((admin: string) =>
    admin.toLowerCase()
  );
  return admins.includes(connectedAddress.toLowerCase());
};

type ProposalMenuProps = {
  proposal: Proposal;
  space: Space;
};

function ProposalMenu({ proposal, space }: ProposalMenuProps) {
  const { showActionSheetWithOptions } = useActionSheet();
  const { connectedAddress, wcConnector, colors } = useAuthState();
  const authDispatch = useAuthDispatch();
  const navigation = useNavigation();
  const toastShowConfig = useToastShowConfig();

  const deleteProposal = async () => {
    try {
      const sign = await client.broadcast(
        //@ts-ignore
        wcConnector,
        connectedAddress,
        space.id,
        "delete-proposal",
        {
          proposal: proposal.id,
        }
      );

      if (sign) {
        Toast.show({
          type: "customSuccess",
          text1: i18n.t("proposalDeleted"),
          ...toastShowConfig,
        });
        authDispatch({
          type: AUTH_ACTIONS.SET_REFRESH_FEED,
          payload: {
            spaceId: space.id,
          },
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "customError",
          text1: i18n.t("unableToDeleteProposal"),
          ...toastShowConfig,
        });
      }
    } catch (e) {
      Toast.show({
        type: "customError",
        text1: i18n.t("unableToDeleteProposal"),
        ...toastShowConfig,
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        const options = [i18n.t("duplicateProposal")];
        let cancelButtonIndex = 1;
        let destructiveButtonIndex = 3;
        if (
          isAdmin(connectedAddress ?? "", space) ||
          connectedAddress === proposal?.author
        ) {
          options.push(i18n.t("deleteProposal"));
          cancelButtonIndex = 2;
          destructiveButtonIndex = 1;
        }

        if (Platform.OS === "ios") {
          options.push(i18n.t("cancel"));
        }

        showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex,
            destructiveButtonIndex,
            textStyle: {
              fontFamily: "Calibre-Medium",
              fontSize: 20,
              color: colors.textColor,
            },
            containerStyle: { backgroundColor: colors.bgDefault },
          },
          (buttonIndex) => {
            if (buttonIndex === 0) {
              navigation.navigate(CREATE_PROPOSAL_SCREEN, { proposal, space });
            } else if (
              (isAdmin(connectedAddress ?? "", space) ||
                connectedAddress === proposal?.author) &&
              buttonIndex === 1
            ) {
              deleteProposal();
            }
          }
        );
      }}
    >
      <IconFont
        name="more"
        size={40}
        color={colors.textColor}
        style={common.containerHorizontalPadding}
      />
    </TouchableOpacity>
  );
}

export default ProposalMenu;
