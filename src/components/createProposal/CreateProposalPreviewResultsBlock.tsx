import React from "react";
import { StyleSheet, View } from "react-native";
import ProposalResultOption from "components/proposal/ProposalResultOption";
import { useAuthState } from "context/authContext";
import { useCreateProposalState } from "context/createProposalContext";
import { Space } from "types/explore";

const styles = StyleSheet.create({
  proposalResultsBlockContainer: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingBottom: 18,
  },
});

interface CreateProposalPreviewResultsBlockProps {
  space: Space;
}

function CreateProposalPreviewResultsBlock({
  space,
}: CreateProposalPreviewResultsBlockProps) {
  const { colors } = useAuthState();
  const { choices } = useCreateProposalState();
  return (
    <View
      style={[
        styles.proposalResultsBlockContainer,
        { borderColor: colors.borderColor },
      ]}
    >
      {choices.map((choice, index) => {
        return (
          <ProposalResultOption
            choice={choice}
            score={0}
            voteAmount={`0 ${space?.symbol}`}
            key={index}
          />
        );
      })}
    </View>
  );
}

export default CreateProposalPreviewResultsBlock;
