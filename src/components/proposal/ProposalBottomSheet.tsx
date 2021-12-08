import React, { useMemo } from "react";
import BottomSheetModal from "components/BottomSheetModal";
import i18n from "i18n-js";
import { Space } from "types/explore";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { CREATE_PROPOSAL_SCREEN } from "constants/navigation";
import Toast from "react-native-toast-message";
import { useToastShowConfig } from "constants/toast";
import { Proposal } from "types/proposal";
import { useNavigation } from "@react-navigation/native";
import { sendEIP712 } from "helpers/EIP712";

const isAdmin = (connectedAddress: string, space: Space) => {
  const admins = (space.admins || []).map((admin: string) =>
    admin.toLowerCase()
  );
  return admins.includes(connectedAddress.toLowerCase());
};

type ProposalMenuProps = {
  proposal: Proposal;
  space: Space;
  bottomSheetRef: any;
  onClose: () => void;
};

function ProposalBottomSheet({
  bottomSheetRef,
  proposal,
  space,
  onClose,
}: ProposalMenuProps) {
  const { connectedAddress, wcConnector } = useAuthState();
  const options = useMemo(() => {
    const setOptions = [i18n.t("duplicateProposal")];
    if (
      isAdmin(connectedAddress ?? "", space) ||
      connectedAddress === proposal?.author
    ) {
      setOptions.push(i18n.t("deleteProposal"));
    }
    return setOptions;
  }, [proposal, space]);
  const authDispatch = useAuthDispatch();
  const snapPoints = [10, options.length > 1 ? 200 : 100];
  const toastShowConfig = useToastShowConfig();
  const navigation: any = useNavigation();
  const destructiveButtonIndex = options.length > 1 ? 1 : 3;

  const deleteProposal = async () => {
    try {
      const sign = await sendEIP712(
        wcConnector,
        connectedAddress,
        space,
        "delete-proposal",
        {
          proposal: {
            id: proposal.id,
          },
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
    <BottomSheetModal
      bottomSheetRef={bottomSheetRef}
      snapPoints={snapPoints}
      options={options}
      onPressOption={(index) => {
        if (index === 0) {
          navigation.navigate(CREATE_PROPOSAL_SCREEN, { proposal, space });
        } else if (
          (isAdmin(connectedAddress ?? "", space) ||
            connectedAddress === proposal?.author) &&
          index === 1
        ) {
          deleteProposal();
        }
        onClose();
      }}
      destructiveButtonIndex={destructiveButtonIndex}
      initialIndex={1}
    />
  );
}

export default ProposalBottomSheet;
