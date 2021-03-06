import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import getProvider from "@snapshot-labs/snapshot.js/src/utils/provider";
import { getBlockNumber } from "@snapshot-labs/snapshot.js/src/utils/web3";
import validations from "@snapshot-labs/snapshot.js/src/validations";
import { Space } from "types/explore";
import i18n from "i18n-js";
import Input from "components/Input";
import common from "styles/common";
import BackButton from "components/BackButton";
import colors from "constants/colors";
import ChoicesBlock from "components/createProposal/ChoicesBlock";
import ActionsBlock from "components/createProposal/ActionsBlock";
import proposal from "constants/proposal";
import MarkdownBody from "components/proposal/MarkdownBody";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import Warning from "components/createProposal/Warning";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { PROPOSAL_SCREEN } from "constants/navigation";
import { Proposal } from "types/proposal";
import { useToastShowConfig } from "constants/toast";
import { sendEIP712 } from "helpers/EIP712";
import { parseErrorMessage } from "helpers/apiUtils";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { createBottomSheetParamsForWalletConnectError } from "constants/bottomSheet";
import { ethers } from "ethers";
import signClient from "helpers/signClient";
import SubmitPasswordModal from "components/wallet/SubmitPasswordModal";
import { useEngineState } from "context/engineContext";
import { addressIsSnapshotWallet } from "helpers/address";
import { getSnapshotDataForSign } from "helpers/snapshotWalletUtils";

const bodyLimit = 6400;

const styles = StyleSheet.create({
  questionInput: {
    fontSize: 24,
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

const isValid = (
  name: string,
  body: string,
  choices: string[],
  start: number | undefined,
  end: number | undefined,
  snapshot: number,
  passValidation: [boolean, string]
) => {
  return (
    name &&
    body.length <= bodyLimit &&
    start &&
    end &&
    end > start &&
    snapshot &&
    snapshot > snapshot / 2 &&
    choices.length >= 2 &&
    !choices.some((a) => a === "") &&
    passValidation[0]
  );
};

async function fetchBlockNumber(
  space: Space,
  setSnapshot: (snapshot: number) => void
) {
  const blockNumber = await getBlockNumber(getProvider(space.network));
  setSnapshot(blockNumber);
}

async function validateUser(
  connectedAddress: string,
  space: Space,
  setPassValidation: (passValidation: [boolean, string]) => void
) {
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
}

interface CreateProposalScreenProps {
  route: {
    params: {
      space: Space;
      proposal?: Proposal;
    };
  };
}

function CreateProposalScreen({ route }: CreateProposalScreenProps) {
  const space = route.params.space;
  const duplicateProposal = route.params.proposal;
  const authDispatch = useAuthDispatch();
  const { snapshotWallets } = useAuthState();
  const { keyRingController, typedMessageManager } = useEngineState();
  const allVotingTypes = proposal.getVotingTypes();
  const dateStart = useMemo(() => {
    return space.voting?.delay
      ? parseInt((Date.now() / 1e3).toFixed()) + space.voting.delay
      : undefined;
  }, [space]);
  const dateEnd = useMemo(() => {
    return space.voting?.period && dateStart
      ? dateStart + space.voting.period
      : undefined;
  }, [space]);
  const { connectedAddress, wcConnector, colors, savedWallets, aliases } =
    useAuthState();
  const [choices, setChoices] = useState(
    duplicateProposal && duplicateProposal?.choices
      ? duplicateProposal.choices
      : [""]
  );
  const [votingType, setVotingType] = useState<{ key: string; text: string }>(
    duplicateProposal
      ? allVotingTypes.find(
          (votingType) => votingType.key === duplicateProposal.type
        ) ?? allVotingTypes[0]
      : allVotingTypes[0]
  );
  const [question, setQuestion] = useState<string>(
    duplicateProposal ? duplicateProposal.title : ""
  );
  const [proposalText, setProposalText] = useState<string>(
    duplicateProposal ? duplicateProposal.body : ""
  );
  const [startTimestamp, setStartTimestamp] = useState<number | undefined>(
    duplicateProposal?.start ?? dateStart
  );
  const [endTimestamp, setEndTimestamp] = useState<number | undefined>(
    duplicateProposal?.end ?? dateEnd
  );
  const [snapshot, setSnapshot] = useState<number | string>(0);
  const [passValidation, setPassValidation] = useState<[boolean, string]>([
    false,
    "basic",
  ]);
  const navigation: any = useNavigation();
  const toastShowConfig = useToastShowConfig();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetWCErrorConfig = createBottomSheetParamsForWalletConnectError(
    colors,
    bottomSheetModalRef,
    authDispatch,
    navigation,
    savedWallets,
    aliases,
    connectedAddress ?? ""
  );
  const isSnapshotWallet = addressIsSnapshotWallet(
    connectedAddress ?? "",
    snapshotWallets
  );

  useEffect(() => {
    fetchBlockNumber(space, setSnapshot);
    validateUser(connectedAddress ?? "", space, setPassValidation);
  }, []);

  async function snapshotWalletProposalCreate(proposal: any) {
    if (keyRingController.isUnlocked()) {
      if (connectedAddress) {
        const formattedAddress = connectedAddress?.toLowerCase();
        const checksumAddress = ethers.utils.getAddress(formattedAddress);
        const { snapshotData, signData } = getSnapshotDataForSign(
          checksumAddress,
          "proposal",
          proposal,
          space
        );

        try {
          const messageId = await typedMessageManager.addUnapprovedMessage(
            {
              data: JSON.stringify(signData),
              from: checksumAddress,
            },
            { origin: "snapshot.org" }
          );
          const cleanMessageParams = await typedMessageManager.approveMessage({
            ...signData,
            metamaskId: messageId,
          });
          const rawSig = await keyRingController.signTypedMessage(
            {
              data: JSON.stringify(cleanMessageParams),
              from: checksumAddress,
            },
            "V4"
          );

          typedMessageManager.setMessageStatusSigned(messageId, rawSig);

          const sign: any = await signClient.send({
            address: checksumAddress,
            sig: rawSig,
            data: snapshotData,
          });

          if (sign) {
            navigation.replace(PROPOSAL_SCREEN, {
              proposalId: sign.id,
              spaceId: space.id,
            });
            Toast.show({
              type: "customSuccess",
              text1: i18n.t("proposalCreated"),
              ...toastShowConfig,
            });
            authDispatch({
              type: AUTH_ACTIONS.SET_REFRESH_FEED,
              payload: {
                spaceId: space.id,
              },
            });
            bottomSheetModalRef?.current?.close();
          } else {
            Toast.show({
              type: "customError",
              text1: i18n.t("unableToCreateProposal"),
              ...toastShowConfig,
            });
          }
        } catch (e) {
          console.log({ e });
          Toast.show({
            type: "customError",
            text1: parseErrorMessage(e, i18n.t("signature_request.error")),
            ...toastShowConfig,
          });
        }
      }
    } else {
      bottomSheetModalDispatch({
        type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
        payload: {
          snapPoints: [10, 450],
          initialIndex: 1,
          ModalContent: () => {
            return (
              <SubmitPasswordModal
                onClose={() => {
                  bottomSheetModalRef.current?.close();
                }}
                navigation={navigation}
              />
            );
          },
          show: true,
          key: `submit-password-modal-${proposal.id}`,
        },
      });
    }
  }

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("createProposal")} />
      </View>
      <ScrollView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        {!passValidation[0] && (
          <Warning passValidation={passValidation} space={space} />
        )}
        <Input
          placeholder={i18n.t("question")}
          style={[
            styles.input,
            styles.questionInput,
            { color: colors.textColor },
          ]}
          placeholderTextColor={colors.textColor}
          value={question}
          onChangeText={(text: string) => {
            setQuestion(text);
          }}
        />
        <Input
          placeholder={i18n.t("whatIsYourProposal")}
          multiline
          numberOfLines={4}
          style={[styles.input, { minHeight: 200, color: colors.textColor }]}
          textAlignVertical="top"
          value={proposalText}
          onChangeText={(text: string) => {
            setProposalText(text);
          }}
          placeholderTextColor={colors.textColor}
        />
        {proposalText !== "" && (
          <View
            style={[
              common.containerHorizontalPadding,
              common.containerVerticalPadding,
            ]}
          >
            <Text
              style={[common.h4, { marginBottom: 6, color: colors.textColor }]}
            >
              {i18n.t("preview")}
            </Text>
            <MarkdownBody body={proposalText} />
          </View>
        )}
        <ChoicesBlock
          choices={choices}
          setChoices={setChoices}
          votingType={votingType}
          setVotingType={setVotingType}
        />
        <View style={{ height: 10, width: 10 }} />
        <ActionsBlock
          space={space}
          startTimestamp={startTimestamp}
          endTimestamp={endTimestamp}
          setStartTimestamp={setStartTimestamp}
          setEndTimestamp={setEndTimestamp}
          isValid={
            !!isValid(
              question,
              proposalText,
              choices,
              startTimestamp,
              endTimestamp,
              typeof snapshot === "number" ? snapshot : parseInt(snapshot),
              passValidation
            )
          }
          snapshot={snapshot}
          onSubmit={async () => {
            const form = {
              name: question,
              body: proposalText,
              start: startTimestamp,
              end: endTimestamp,
              type: votingType.key,
              snapshot:
                typeof snapshot === "number" ? snapshot : parseInt(snapshot),
              choices,
              metadata: {
                network: space.network,
                strategies: space.strategies,
                plugins: {},
              },
            };

            try {
              if (isSnapshotWallet) {
                await snapshotWalletProposalCreate(form);
              } else {
                const sign: any = await sendEIP712(
                  wcConnector,
                  connectedAddress,
                  space,
                  "proposal",
                  form
                );

                if (sign) {
                  navigation.replace(PROPOSAL_SCREEN, {
                    proposalId: sign.id,
                    spaceId: space.id,
                  });
                  Toast.show({
                    type: "customSuccess",
                    text1: i18n.t("proposalCreated"),
                    ...toastShowConfig,
                  });
                  authDispatch({
                    type: AUTH_ACTIONS.SET_REFRESH_FEED,
                    payload: {
                      spaceId: space.id,
                    },
                  });
                } else {
                  Toast.show({
                    type: "customError",
                    text1: i18n.t("unableToCreateProposal"),
                    ...toastShowConfig,
                  });
                }
              }
            } catch (e) {
              Toast.show({
                type: "customError",
                text1: parseErrorMessage(e, i18n.t("unableToCreateProposal")),
                ...toastShowConfig,
              });
              bottomSheetModalDispatch({
                type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                payload: {
                  ...bottomSheetWCErrorConfig,
                },
              });
            }

            return true;
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default CreateProposalScreen;
