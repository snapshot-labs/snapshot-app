import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView, KeyboardAvoidingView } from "react-native";
import Input from "components/Input";
import i18n from "i18n-js";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthState } from "context/authContext";
import {
  CREATE_PROPOSAL_ACTIONS,
  useCreateProposalDispatch,
  useCreateProposalState,
} from "context/createProposalContext";
import common from "styles/common";
import colors from "constants/colors";
import CreateProposalHeader from "components/createProposal/CreateProposalHeader";
import CreateProposalFooter from "components/createProposal/CreateProposalFooter";
import Device from "helpers/device";
import { useNavigation } from "@react-navigation/native";
import { CREATE_PROPOSAL_SCREEN_STEP_TWO } from "constants/navigation";
import IphoneBottomSafeAreaViewBackground from "components/IphoneBottomSafeAreaViewBackground";
import { Space } from "types/explore";
import validations from "@snapshot-labs/snapshot.js/src/validations/index";
import Warning from "components/createProposal/Warning";

const styles = StyleSheet.create({
  titleInput: {
    fontSize: 28,
    fontFamily: "Calibre-Semibold",
    height: 40,
    lineHeight: 26,
    marginTop: 6,
  },
  input: {
    borderLeftWidth: 0,
    borderRadius: 0,
    borderTopWidth: 0,
    borderWidth: 0,
    paddingLeft: 0,
    marginBottom: 0,
    marginTop: 0,
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    lineHeight: 20,
    color: colors.textColor,
    height: "auto",
    paddingTop: 0,
    marginLeft: 16,
  },
});

async function validateUser(
  connectedAddress: string,
  space: Space,
  setPassValidation: (passValidation: [boolean, string]) => void,
  setLoadingValidation: (validation: boolean) => void
) {
  try {
    setLoadingValidation(true);
    const validationName = space.validation?.name ?? "basic";
    const validationParams = space.validation?.params ?? {};
    //@ts-ignore
    const isValid = await validations[validationName](
      connectedAddress,
      { ...space },
      "",
      { ...validationParams }
    );
    setPassValidation([isValid, validationName]);
  } catch (e) {}
  setLoadingValidation(false);
}

interface CreateProposalStepOneProps {
  route: {
    params: {
      space: Space;
    };
  };
}

function CreateProposalStepOne({ route }: CreateProposalStepOneProps) {
  const space = route.params.space;
  const { colors, connectedAddress } = useAuthState();
  const { title: proposalTitle, body: proposalBody } = useCreateProposalState();
  const createProposalDispatch = useCreateProposalDispatch();
  const navigation = useNavigation();
  const [title, setTitle] = useState<string>(proposalTitle);
  const [body, setBody] = useState<string>(proposalBody);
  const [loadingValidation, setLoadingValidation] = useState(true);
  const [passValidation, setPassValidation] = useState<[boolean, string]>([
    false,
    "basic",
  ]);

  useEffect(() => {
    validateUser(
      connectedAddress,
      space,
      setPassValidation,
      setLoadingValidation
    );
  }, []);

  return (
    <>
      <SafeAreaView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        <CreateProposalHeader
          currentStep={1}
          onClose={() => {
            navigation.goBack();
          }}
        />
        {!loadingValidation && !passValidation[0] && (
          <Warning passValidation={passValidation} space={space} />
        )}
        <ScrollView>
          <Input
            placeholder={i18n.t("title")}
            style={[
              styles.input,
              styles.titleInput,
              { color: colors.textColor },
            ]}
            placeholderTextColor={colors.secondaryGray}
            value={title}
            onChangeText={(text: string) => {
              setTitle(text);
            }}
          />
          <Input
            placeholder={i18n.t("body")}
            multiline
            numberOfLines={4}
            style={[styles.input, { minHeight: 200, color: colors.textColor }]}
            textAlignVertical="top"
            value={body}
            onChangeText={(text: string) => {
              setBody(text);
            }}
            placeholderTextColor={colors.secondaryGray}
          />
        </ScrollView>
        <KeyboardAvoidingView behavior={Device.isIos() ? "padding" : "height"}>
          <CreateProposalFooter
            actionButtonTitle={i18n.t("next")}
            onPressAction={() => {
              createProposalDispatch({
                type: CREATE_PROPOSAL_ACTIONS.UPDATE_TITLE_AND_BODY,
                payload: {
                  title,
                  body,
                },
              });
              navigation.navigate(CREATE_PROPOSAL_SCREEN_STEP_TWO, { space });
            }}
            disabledAction={
              title.length === 0 || body.length === 0 || !passValidation[0]
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
      <IphoneBottomSafeAreaViewBackground />
    </>
  );
}

export default CreateProposalStepOne;
