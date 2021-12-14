import React from "react";
import { TouchableOpacity } from "react-native";
import IconFont from "../IconFont";
import common from "styles/common";
import { useAuthState } from "context/authContext";

interface ProposalMenuProps {
  showBottomSheetModal: () => void;
}

function ProposalMenu({ showBottomSheetModal }: ProposalMenuProps) {
  const { colors } = useAuthState();
  return (
    <TouchableOpacity
      onPress={showBottomSheetModal}
      hitSlop={{ top: 20, bottom: 20, left: 50, right: 50 }}
    >
      <IconFont
        name="more"
        size={32}
        color={colors.textColor}
        style={common.containerHorizontalPadding}
      />
    </TouchableOpacity>
  );
}

export default ProposalMenu;
