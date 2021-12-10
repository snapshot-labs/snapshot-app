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
import { deleteProposal } from "helpers/apiUtils";

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
          deleteProposal(
            wcConnector,
            connectedAddress ?? "",
            space,
            proposal,
            authDispatch,
            toastShowConfig
          );
        }
        onClose();
      }}
      destructiveButtonIndex={destructiveButtonIndex}
      initialIndex={1}
    />
  );
}

export default ProposalBottomSheet;
