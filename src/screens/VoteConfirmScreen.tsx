import React from "react";
import VoteConfirmModal from "components/proposal/VoteConfirmModal";
import { useNavigation } from "@react-navigation/native";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";
import { SafeAreaView } from "react-native";
import { useAuthState } from "context/authContext";

interface VoteConfirmScreenProps {
  route: {
    params: {
      proposal: Proposal;
      space: Space;
      selectedChoices: number[];
      totalScore: number;
      getProposal: () => void;
    };
  };
}

function VoteConfirmScreen({ route }: VoteConfirmScreenProps) {
  const { proposal, selectedChoices, space, totalScore, getProposal } =
    route.params;
  const { colors } = useAuthState();
  const navigation: any = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgDefault }}>
      <VoteConfirmModal
        onClose={() => {}}
        onSuccess={() => {
          navigation.pop(2);
        }}
        proposal={proposal}
        selectedChoices={selectedChoices}
        space={space}
        totalScore={totalScore}
        getProposal={getProposal}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

export default VoteConfirmScreen;
