import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { Space } from "../../types/explore";
import { useActionSheet } from "@expo/react-native-action-sheet";
import i18n from "i18n-js";
import colors from "../../constants/colors";
import { useAuthState } from "../../context/authContext";
import common, { actionSheetTextStyles } from "../../styles/common";
import { Proposal } from "../../types/proposal";
import { useNavigation } from "@react-navigation/native";
import client from "../../util/snapshotClient";
import Toast from "react-native-toast-message";

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
  const { connectedAddress, wcConnector } = useAuthState();
  const navigation = useNavigation();

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
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "customError",
          text1: i18n.t("unableToDeleteProposal"),
        });
      }
    } catch (e) {
      Toast.show({
        type: "customError",
        text1: i18n.t("unableToDeleteProposal"),
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
            textStyle: actionSheetTextStyles,
          },
          (buttonIndex) => {
            if (
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
      <FontAwesome5Icon
        name="ellipsis-h"
        size={20}
        color={colors.textColor}
        style={common.containerHorizontalPadding}
      />
    </TouchableOpacity>
  );
}

export default ProposalMenu;
