import React from "react";
import BlockCastVote from "components/proposal/BlockCastVote";
import { SafeAreaView, View } from "react-native";
import { useAuthState } from "context/authContext";
import common from "styles/common";
import BackButton from "components/BackButton";
import i18n from "i18n-js";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";

interface VoteScreenProps {
  route: {
    params: {
      proposal: Proposal;
      space: Space;
      getProposal: () => void;
    };
  };
}

function VoteScreen({ route }: VoteScreenProps) {
  const { proposal, space, getProposal } = route.params;
  const { colors } = useAuthState();

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          common.justifySpaceBetween,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("castVote")} />
      </View>
      <BlockCastVote
        proposal={proposal}
        space={space}
        getProposal={getProposal}
      />
    </SafeAreaView>
  );
}

export default VoteScreen;
