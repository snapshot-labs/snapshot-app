import React from "react";
import { StyleSheet, View } from "react-native";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  proposalInfoBlockContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    paddingBottom: 18,
  },
});

function ProposalInfoBlock() {
  const { colors } = useAuthState();

  return (
    <View
      style={[
        styles.proposalInfoBlockContainer,
        { borderColor: colors.borderColor },
      ]}
    >

    </View>
  );
}

export default ProposalInfoBlock;
