import Button from "components/Button";
import React from "react";
import { StyleSheet, View } from "react-native";
import common from "styles/common";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  footerContainer: {
    paddingTop: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  ButtonStyle: {
    paddingVertical: 14,
    minWidth: 94,
  },
  ButtonTitleStyle: {
    textTransform: "uppercase",
    fontSize: 14,
  },
});

interface CreateProposalFooterProps {
  backButtonTitle?: string;
  actionButtonTitle: string;
  disabledAction?: boolean;
  onPressAction: () => void;
  onPressBack?: () => void;
}

function CreateProposalFooter({
  backButtonTitle = undefined,
  onPressBack = () => {},
  actionButtonTitle,
  onPressAction,
  disabledAction = false,
}: CreateProposalFooterProps) {
  const { colors } = useAuthState();
  return (
    <View
      style={[
        common.row,
        styles.footerContainer,
        { backgroundColor: colors.navBarBg },
      ]}
    >
      {backButtonTitle !== undefined && (
        <Button
          title={backButtonTitle}
          onPress={onPressBack}
          buttonContainerStyle={[styles.ButtonStyle, { marginRight: 12 }]}
          buttonTitleStyle={styles.ButtonTitleStyle}
        />
      )}
      <Button
        onPress={onPressAction}
        title={actionButtonTitle}
        disabled={disabledAction}
        buttonContainerStyle={styles.ButtonStyle}
        buttonTitleStyle={styles.ButtonTitleStyle}
        primary
      />
    </View>
  );
}

export default CreateProposalFooter;
