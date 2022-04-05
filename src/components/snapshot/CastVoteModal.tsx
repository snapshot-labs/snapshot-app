import React, { useEffect, useState } from "react";
import { View, Text, ViewStyle } from "react-native";
import i18n from "i18n-js";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";
import { getPower } from "helpers/snapshot";
import Button from "../Button";
import VotingSingleChoice from "../proposal/VotingSingleChoice";
import VotingRankedChoice from "../proposal/VotingRankedChoice";
import { useAuthDispatch, useAuthState } from "context/authContext";
import VotingQuadratic from "../proposal/VotingQuadratic";
import VotingApproval from "../proposal/VotingApproval";
import common from "styles/common";
import Toast from "react-native-toast-message";
import { addressIsSnapshotWallet } from "helpers/address";
import { useToastShowConfig } from "constants/toast";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { ethers } from "ethers";
import { getSnapshotDataForSign } from "helpers/snapshotWalletUtils";
import signClient from "helpers/signClient";
import { parseErrorMessage } from "helpers/apiUtils";
import SubmitPasswordModal from "components/wallet/SubmitPasswordModal";
import { useEngineState } from "context/engineContext";
import { sendEIP712 } from "helpers/EIP712";
import { createBottomSheetParamsForWalletConnectError } from "constants/bottomSheet";

interface CastVoteModalProps {
  proposal: Proposal;
  space: Space;
  getProposal: () => void;
  voteButtonStyle?: ViewStyle;
  navigation: any;
}

async function loadPower(
  connectedAddress: string,
  proposal: Proposal,
  space: Space,
  setTotalScore: (totalScore: number) => void
) {
  try {
    if (!connectedAddress || !proposal.author) return;
    const response = await getPower(space, connectedAddress, proposal);
    if (typeof response.totalScore === "number") {
      setTotalScore(response.totalScore);
    }
  } catch (e) {}
}

function CastVoteModal({
  proposal,
  space,
  getProposal,
  navigation,
  voteButtonStyle = {
    width: "100%",
    paddingHorizontal: 16,
  },
}: CastVoteModalProps) {
  const { colors } = useAuthState();
  const {
    connectedAddress,
    isWalletConnect,
    snapshotWallets,
    wcConnector,
    savedWallets,
    aliases,
  } = useAuthState();
  const [selectedChoices, setSelectedChoices] = useState<any>([]);
  const { keyRingController, typedMessageManager } = useEngineState();
  const isSnapshotWallet = addressIsSnapshotWallet(
    connectedAddress ?? "",
    snapshotWallets
  );
  const authDispatch = useAuthDispatch();
  const toastShowConfig = useToastShowConfig();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState(0);
  const bottomSheetWCErrorConfig = createBottomSheetParamsForWalletConnectError(
    colors,
    bottomSheetModalRef,
    authDispatch,
    navigation,
    savedWallets,
    aliases,
    connectedAddress ?? ""
  );
  const disabledConfirmVote =
    loading || (!isSnapshotWallet && !isWalletConnect) || totalScore === 0;

  async function snapshotWalletVote() {
    let formattedSelectedChoices = selectedChoices;

    if (proposal.type === "single-choice" || proposal.type === "basic") {
      formattedSelectedChoices = selectedChoices[0];
    }
    const payload = {
      proposal: {
        id: proposal.id,
        type: proposal.type,
      },
      choice: formattedSelectedChoices,
    };
    const formattedAddress = connectedAddress?.toLowerCase();
    const checksumAddress = ethers.utils.getAddress(formattedAddress);
    const { snapshotData, signData } = getSnapshotDataForSign(
      checksumAddress,
      "vote",
      payload,
      space
    );
    if (keyRingController.isUnlocked()) {
      setLoading(true);
      if (connectedAddress) {
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

          const sign = await signClient.send({
            address: checksumAddress,
            sig: rawSig,
            data: snapshotData,
          });

          if (sign) {
            Toast.show({
              type: "customSuccess",
              text1: i18n.t("yourVoteIsIn"),
              ...toastShowConfig,
            });
            setLoading(false);
            getProposal();
          } else {
            setLoading(false);
            Toast.show({
              type: "customError",
              text1: i18n.t("unableToCastVote"),
              ...toastShowConfig,
            });
          }
        } catch (e) {
          console.log("SNAPSHOT ERR", e);
          setLoading(false);
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
                onSuccess={async () => {
                  setLoading(true);
                  try {
                    const messageId =
                      await typedMessageManager.addUnapprovedMessage(
                        {
                          data: JSON.stringify(signData),
                          from: checksumAddress,
                        },
                        { origin: "snapshot.org" }
                      );
                    const cleanMessageParams =
                      await typedMessageManager.approveMessage({
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

                    typedMessageManager.setMessageStatusSigned(
                      messageId,
                      rawSig
                    );

                    const sign = await signClient.send({
                      address: checksumAddress,
                      sig: rawSig,
                      data: snapshotData,
                    });

                    if (sign) {
                      Toast.show({
                        type: "customSuccess",
                        text1: i18n.t("yourVoteIsIn"),
                        ...toastShowConfig,
                      });
                      setLoading(false);
                      getProposal();
                    } else {
                      setLoading(false);
                      Toast.show({
                        type: "customError",
                        text1: i18n.t("unableToCastVote"),
                        ...toastShowConfig,
                      });
                    }
                  } catch (e) {
                    setLoading(false);
                    Toast.show({
                      type: "customError",
                      text1: parseErrorMessage(
                        e,
                        i18n.t("signature_request.error")
                      ),
                      ...toastShowConfig,
                    });
                  }
                }}
              />
            );
          },
          show: true,
          key: `submit-password-modal-${proposal.id}`,
        },
      });
    }
  }

  let VotesComponent;

  if (proposal.type === "single-choice" || proposal.type === "basic") {
    VotesComponent = VotingSingleChoice;
  } else if (proposal.type === "ranked-choice") {
    VotesComponent = VotingRankedChoice;
  } else if (proposal.type === "quadratic" || proposal.type === "weighted") {
    VotesComponent = VotingQuadratic;
  } else if (proposal.type === "approval") {
    VotesComponent = VotingApproval;
  }

  useEffect(() => {
    loadPower(connectedAddress ?? "", proposal, space, setTotalScore);
  }, [space]);

  if (VotesComponent) {
    return (
      <>
        <View>
          <View
            style={{
              paddingVertical: 24,
              paddingHorizontal:
                proposal.type === "quadratic" || proposal.type === "weighted"
                  ? 8
                  : 14,
            }}
          >
            <VotesComponent
              proposal={proposal}
              selectedChoices={selectedChoices}
              setSelectedChoices={setSelectedChoices}
            />
          </View>

          <View style={[voteButtonStyle, { marginBottom: 24 }]}>
            <Button
              title={i18n.t("confirmVote")}
              onPress={async () => {
                if (
                  loading ||
                  (!isSnapshotWallet && !isWalletConnect) ||
                  totalScore === 0
                ) {
                  return;
                }

                setLoading(true);

                let formattedSelectedChoices = selectedChoices;

                if (
                  proposal.type === "single-choice" ||
                  proposal.type === "basic"
                ) {
                  formattedSelectedChoices = selectedChoices[0];
                }

                try {
                  if (isSnapshotWallet) {
                    await snapshotWalletVote();
                  } else {
                    const checksumAddress = ethers.utils.getAddress(
                      connectedAddress ?? ""
                    );
                    const sign = await sendEIP712(
                      wcConnector,
                      checksumAddress ?? "",
                      space,
                      "vote",
                      {
                        proposal: {
                          id: proposal.id,
                          type: proposal.type,
                        },
                        choice: formattedSelectedChoices,
                      }
                    );

                    if (sign) {
                      Toast.show({
                        type: "customSuccess",
                        text1: i18n.t("yourVoteIsIn"),
                        ...toastShowConfig,
                      });

                      getProposal();
                    } else {
                      Toast.show({
                        type: "customError",
                        text1: i18n.t("unableToCastVote"),
                        ...toastShowConfig,
                      });
                    }
                  }
                } catch (e) {
                  Toast.show({
                    type: "customError",
                    text1: parseErrorMessage(e, i18n.t("unableToCastVote")),
                    ...toastShowConfig,
                  });

                  if (isWalletConnect) {
                    bottomSheetModalDispatch({
                      type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                      payload: {
                        ...bottomSheetWCErrorConfig,
                      },
                    });
                  }
                }

                setLoading(false);
              }}
              disabled={disabledConfirmVote}
              loading={loading}
              buttonContainerStyle={{
                backgroundColor: disabledConfirmVote
                  ? colors.disabledButtonBg
                  : colors.bgBlue,
                borderColor: disabledConfirmVote
                  ? "transparent"
                  : colors.bgBlue,
              }}
              buttonTitleStyle={{
                color: colors.white,
              }}
            />
          </View>
        </View>
      </>
    );
  }

  return (
    <View
      style={[common.alignItemsCenter, common.justifyCenter, { width: "100%" }]}
    >
      <Text style={[common.h4, { color: colors.textColor }]}>
        {i18n.t("vote")}
      </Text>
    </View>
  );
}

export default CastVoteModal;
