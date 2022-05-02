import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Text,
} from "react-native";
import i18n from "i18n-js";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthState } from "context/authContext";
import {
  CREATE_PROPOSAL_ACTIONS,
  useCreateProposalDispatch,
  useCreateProposalState,
} from "context/createProposalContext";
import common from "styles/common";
import CreateProposalHeader from "components/createProposal/CreateProposalHeader";
import CreateProposalFooter from "components/createProposal/CreateProposalFooter";
import Device from "helpers/device";
import { useNavigation } from "@react-navigation/native";
import VotingTypeScrollViewPicker from "components/createProposal/VotingTypeScrollViewPicker";
import { Space } from "types/explore";
import { Proposal } from "types/proposal";
import proposal from "constants/proposal";
import ChoicesBlock from "components/createProposal/ChoicesBlock";

const styles = StyleSheet.create({
  titleInput: {
    fontSize: 28,
    fontFamily: "Calibre-Semibold",
    height: 40,
    lineHeight: 26,
    marginTop: 6,
  },
  selectionTitle: {
    fontSize: 18,
    fontFamily: "Calibre-Semibold",
    paddingLeft: 14,
    marginTop: 22,
    marginBottom: 14,
  },
});

interface CreateProposalStepTwo {
  route: {
    params: {
      proposal?: Proposal;
      space: Space;
    };
  };
}

function CreateProposalStepTwo({ route }: CreateProposalStepTwo) {
  const { colors } = useAuthState();
  const duplicateProposal = route.params?.proposal;
  const { title: proposalTitle, body: proposalBody } = useCreateProposalState();
  const allVotingTypes = proposal.getVotingTypes();
  const createProposalDispatch = useCreateProposalDispatch();
  const navigation = useNavigation();
  const [votingType, setVotingType] = useState<{ key: string; text: string }>(
    duplicateProposal
      ? allVotingTypes.find(
          (votingType) => votingType.key === duplicateProposal.type
        ) ?? allVotingTypes[0]
      : allVotingTypes[0]
  );
  const [choices, setChoices] = useState(
    duplicateProposal && duplicateProposal?.choices
      ? duplicateProposal.choices
      : [""]
  );

  return (
    <>
      <SafeAreaView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        <CreateProposalHeader
          currentStep={2}
          onClose={() => {
            navigation.goBack();
          }}
        />
        <ScrollView>
          <Text style={[styles.selectionTitle, { color: colors.textColor }]}>
            {i18n.t("selectTypeOfVoting")}
          </Text>
          <VotingTypeScrollViewPicker
            setVotingType={setVotingType}
            votingType={votingType}
          />
          <Text style={[styles.selectionTitle, { color: colors.textColor }]}>
            {i18n.t("addUpTo10Choices")}
          </Text>
          <ChoicesBlock choices={choices} setChoices={setChoices} />
        </ScrollView>
      </SafeAreaView>
      <KeyboardAvoidingView behavior={Device.isIos() ? "padding" : "height"}>
        <CreateProposalFooter
          backButtonTitle={i18n.t("back")}
          onPressBack={() => {
            navigation.goBack();
          }}
          actionButtonTitle={i18n.t("next")}
          onPressAction={() => {}}
        />
      </KeyboardAvoidingView>
    </>
  );
}

export default CreateProposalStepTwo;
