import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import i18n from "i18n-js";
import common from "styles/common";
import Toast from "react-native-toast-message";
import colors from "constants/colors";
import IconFont from "../IconFont";
import { styles as buttonStyles } from "../Button";
import { explorerUrl, getChoiceString, n, shorten } from "helpers/miscUtils";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { useToastShowConfig } from "constants/toast";
import { sendEIP712 } from "helpers/EIP712";
import { parseErrorMessage } from "helpers/apiUtils";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { createBottomSheetParamsForWalletConnectError } from "constants/bottomSheet";
import { addressIsSnapshotWallet } from "helpers/address";
import { getRandomAliasWallet } from "helpers/aliasUtils";
import { ethers } from "ethers";
import signClient, { domain } from "helpers/signClient";
import {
  aliasTypes,
  vote2Types,
  voteArray2Types,
  voteArrayTypes,
  voteString2Types,
  voteStringTypes,
  voteTypes,
} from "@snapshot-labs/snapshot.js/src/sign/types";
import SignModal from "components/wallet/SignModal";
import SubmitPasswordModal from "components/wallet/SubmitPasswordModal";
import { useEngineState } from "context/engineContext";
import Device from "helpers/device";

const { width } = Dimensions.get("screen");

const buttonWidth = width / 2 - 32;

const styles = StyleSheet.create({
  view: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    backgroundColor: colors.bgDefault,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    flexDirection: "row",
    width,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  mainContent: {
    marginTop: 18,
    marginHorizontal: 24,
    padding: 24,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  buttonContainer: {
    marginVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  rowTitle: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    color: colors.darkGray,
  },
  rowValue: {
    marginLeft: "auto",
    fontSize: 18,
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
});

interface VoteConfirmModalProps {
  onClose: () => void;
  proposal: any;
  selectedChoices: any;
  space: any;
  totalScore: number;
  getProposal: () => void;
  navigation: any;
}

function VoteConfirmModal({
  onClose,
  proposal,
  selectedChoices,
  space,
  totalScore,
  getProposal,
  navigation,
}: VoteConfirmModalProps) {
  const formattedChoiceString = getChoiceString(proposal, selectedChoices);
  const {
    connectedAddress,
    wcConnector,
    isWalletConnect,
    colors,
    aliases,
    savedWallets,
    snapshotWallets,
  } = useAuthState();
  const { keyRingController, typedMessageManager } = useEngineState();
  const authDispatch = useAuthDispatch();
  const [loading, setLoading] = useState<boolean>(false);
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

  async function snapshotWalletVote() {
    if (keyRingController.isUnlocked()) {
      if (connectedAddress) {
        const formattedAddress = connectedAddress?.toLowerCase();
        const checksumAddress = ethers.utils.getAddress(formattedAddress);
        console.log({ checksumAddress });
        let formattedSelectedChoices = selectedChoices;

        if (proposal.type === "single-choice") {
          formattedSelectedChoices = selectedChoices[0];
        }
        const timestamp = ~~(Date.now() / 1e3);
        const snapshotHubMessage = {
          space: space.id,
          proposal: proposal.id,
          type: proposal.type,
          choice: formattedSelectedChoices,
          metadata: JSON.stringify({}),
          from: checksumAddress,
          timestamp,
        };
        const type2 = snapshotHubMessage.proposal.startsWith("0x");
        let types = type2 ? vote2Types : voteTypes;
        if (["approval", "ranked-choice"].includes(snapshotHubMessage.type))
          types = type2 ? voteArray2Types : voteArrayTypes;
        if (["quadratic", "weighted"].includes(snapshotHubMessage.type)) {
          types = type2 ? voteString2Types : voteStringTypes;
          snapshotHubMessage.choice = JSON.stringify(snapshotHubMessage.choice);
        }
        const snapshotData = {
          domain,
          types,
          message: snapshotHubMessage,
        };
        const updatedTypes = {
          ...snapshotData.types,
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
          ],
        };
        const wcData: any = {
          domain,
          types: updatedTypes,
          message: snapshotHubMessage,
          primaryType: "Vote",
        };

        bottomSheetModalDispatch({
          type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
          payload: {
            show: true,
            ModalContent: () => {
              return (
                <SignModal
                  messageParamsData={snapshotHubMessage}
                  onClose={() => {
                    bottomSheetModalRef?.current?.close();
                  }}
                  onSign={async () => {
                    try {
                      const messageId =
                        await typedMessageManager.addUnapprovedMessage(
                          {
                            data: JSON.stringify(wcData),
                            from: checksumAddress,
                          },
                          { origin: "snapshot.org" }
                        );
                      const cleanMessageParams =
                        await typedMessageManager.approveMessage({
                          ...wcData,
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

                        bottomSheetModalRef.current?.close();
                        getProposal();
                        onClose();
                      } else {
                        Toast.show({
                          type: "customError",
                          text1: i18n.t("unableToCastVote"),
                          ...toastShowConfig,
                        });
                      }
                    } catch (e) {
                      console.log({ e });
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
            initialIndex: 1,
            snapPoints: [10, Device.getDeviceHeight()],
            key: `vote-message-modal-${proposal.id}`,
          },
        });
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
    <View style={[styles.container, { backgroundColor: colors.bgDefault }]}>
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <Text
          style={[common.h3, { textAlign: "center", color: colors.textColor }]}
        >
          {i18n.t("confirmVote")}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setLoading(false);
            onClose();
          }}
          style={{ marginLeft: "auto" }}
        >
          <IconFont name="close" size={20} color={colors.darkGray} />
        </TouchableOpacity>
      </View>
      <Text
        style={[
          common.h4,
          { paddingHorizontal: 16, paddingTop: 16, color: colors.textColor },
        ]}
      >
        {i18n.t("areYouSureYouWantToVote", {
          choice: shorten(formattedChoiceString, "choice"),
        })}
      </Text>
      <Text
        style={[
          common.h4,
          { paddingHorizontal: 16, paddingTop: 8, color: colors.textColor },
        ]}
      >
        {i18n.t("thisActionCannotBeUndone")}
      </Text>
      <View style={[styles.mainContent, { borderColor: colors.borderColor }]}>
        <View style={styles.row}>
          <Text
            style={[styles.rowTitle, { width: 100, color: colors.textColor }]}
          >
            {i18n.t("optionss")}
          </Text>
          <View style={{ marginLeft: "auto" }}>
            <Text
              style={[
                styles.rowValue,
                {
                  textAlign: "right",
                  width: width / 2,
                  color: colors.textColor,
                },
              ]}
            >
              {formattedChoiceString}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>Snapshot</Text>
          <TouchableOpacity
            style={{ marginLeft: "auto" }}
            onPress={() => {
              const url = explorerUrl(
                space.network,
                proposal.snapshot,
                "block"
              );
              Linking.openURL(url);
            }}
          >
            <View style={styles.linkContainer}>
              <Text style={[styles.rowValue, { color: colors.textColor }]}>
                {n(proposal.snapshot, "0,0")}
              </Text>
              <IconFont
                name="external-link"
                size={18}
                color={colors.darkGray}
                style={{ marginLeft: 6 }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>{i18n.t("yourVotingPower")}</Text>
          <Text style={[styles.rowValue, { color: colors.textColor }]}>
            {n(totalScore)} {shorten(space.symbol, "symbol")}
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            setLoading(false);
            onClose();
          }}
        >
          <View
            style={[
              buttonStyles.button,
              { width: buttonWidth, borderColor: colors.borderColor },
            ]}
          >
            <Text
              style={[buttonStyles.buttonTitle, { color: colors.textColor }]}
            >
              {i18n.t("cancel")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            if (loading || !isWalletConnect || totalScore === 0) return;

            setLoading(true);

            let formattedSelectedChoices = selectedChoices;

            if (proposal.type === "single-choice") {
              formattedSelectedChoices = selectedChoices[0];
            }

            try {
              if (isSnapshotWallet) {
                snapshotWalletVote();
              } else {
                const sign = await sendEIP712(
                  wcConnector,
                  connectedAddress,
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
                  onClose();
                } else {
                  Toast.show({
                    type: "customError",
                    text1: i18n.t("unableToCastVote"),
                    ...toastShowConfig,
                  });
                }
              }
            } catch (e) {
              console.log("FAILED TO VOTE");
              Toast.show({
                type: "customError",
                text1: parseErrorMessage(e, i18n.t("unableToCastVote")),
                ...toastShowConfig,
              });
              bottomSheetModalDispatch({
                type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                payload: {
                  ...bottomSheetWCErrorConfig,
                },
              });
            }

            setLoading(false);
          }}
        >
          <View
            style={[
              buttonStyles.button,
              {
                width: buttonWidth,
                marginLeft: 16,
                backgroundColor:
                  !isWalletConnect || loading || totalScore === 0
                    ? colors.borderColor
                    : "transparent",
                borderColor:
                  !isWalletConnect || loading || totalScore === 0
                    ? colors.borderColor
                    : colors.textColor,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textColor} />
            ) : (
              <Text
                style={[
                  buttonStyles.buttonTitle,
                  {
                    color:
                      !isWalletConnect || loading || totalScore === 0
                        ? colors.white
                        : colors.textColor,
                  },
                ]}
              >
                {i18n.t("vote")}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default VoteConfirmModal;
