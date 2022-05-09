import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Text,
  View,
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
import proposal, { VOTING_TYPES } from "constants/proposal";
import ChoicesBlock from "components/createProposal/ChoicesBlock";
import IPhoneTopSafeAreaViewBackground from "components/IPhoneTopSafeAreaViewBackground";
import IphoneBottomSafeAreaViewBackground from "components/IphoneBottomSafeAreaViewBackground";
import { CREATE_PROPOSAL_SCREEN_STEP_THREE } from "constants/navigation";

const styles = StyleSheet.create({
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
      space: Space;
    };
  };
}

function CreateProposalStepTwo({ route }: CreateProposalStepTwo) {
  const { colors } = useAuthState();
  const { choices: proposalChoices, votingType: proposalVotingType } =
    useCreateProposalState();
  const allVotingTypes = proposal.getVotingTypes();
  const createProposalDispatch = useCreateProposalDispatch();
  const navigation = useNavigation();
  const [votingType, setVotingType] = useState<{ key: string; text: string }>(
    allVotingTypes.find(
      (votingType) => votingType.key === proposalVotingType
    ) ?? allVotingTypes[0]
  );
  const [choices, setChoices] = useState(proposalChoices || [""]);
  const scrollRef = useRef(null);
  const isValidChoices =
    choices?.length >= 2 && !choices?.some((a) => a === "");

  useEffect(() => {
    if (votingType.key === VOTING_TYPES.basic) {
      setChoices(["For", "Against", "Abstain"]);
    }
  }, [votingType]);

  return (
    <>
      <IPhoneTopSafeAreaViewBackground />
      <SafeAreaView
        style={[
          common.screen,
          { backgroundColor: colors.bgDefault, paddingBottom: 0 },
        ]}
      >
        <CreateProposalHeader
          currentStep={2}
          onClose={() => {
            createProposalDispatch({
              type: CREATE_PROPOSAL_ACTIONS.UPDATE_CHOICES_AND_VOTING_TYPE,
              payload: {
                votingType: votingType.key,
                choices,
              },
            });
            navigation.goBack();
          }}
        />
        <ScrollView showsVerticalScrollIndicator={false} ref={scrollRef}>
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
          <ChoicesBlock
            choices={choices}
            setChoices={setChoices}
            scrollRef={scrollRef}
            votingType={votingType?.key}
          />
        </ScrollView>
        <KeyboardAvoidingView behavior={Device.isIos() ? "padding" : "height"}>
          <CreateProposalFooter
            backButtonTitle={i18n.t("back")}
            onPressBack={() => {
              createProposalDispatch({
                type: CREATE_PROPOSAL_ACTIONS.UPDATE_CHOICES_AND_VOTING_TYPE,
                payload: {
                  votingType: votingType.key,
                  choices,
                },
              });
              navigation.goBack();
            }}
            actionButtonTitle={i18n.t("next")}
            onPressAction={() => {
              createProposalDispatch({
                type: CREATE_PROPOSAL_ACTIONS.UPDATE_CHOICES_AND_VOTING_TYPE,
                payload: {
                  votingType: votingType.key,
                  choices,
                },
              });
              navigation.navigate(CREATE_PROPOSAL_SCREEN_STEP_THREE, {
                space: route.params.space,
              });
            }}
            disabledAction={!isValidChoices}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
      <IphoneBottomSafeAreaViewBackground />
    </>
  );
}

export default CreateProposalStepTwo;
