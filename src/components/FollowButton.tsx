import React, { useState } from "react";
import Button from "./Button";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { Wallet } from "@ethersproject/wallet";
import signClient, { domain } from "helpers/signClient";
import "@ethersproject/shims";
import { checkAlias, getRandomAliasWallet, setAlias } from "helpers/aliasUtils";
import find from "lodash/find";
import i18n from "i18n-js";
import { useToastShowConfig } from "constants/toast";
import Toast from "react-native-toast-message";
import get from "lodash/get";
import { getFollows, parseErrorMessage } from "helpers/apiUtils";
import { ContextDispatch } from "types/context";
import { Space } from "types/explore";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import { createBottomSheetParamsForWalletConnectError } from "constants/bottomSheet";
import { useNavigation } from "@react-navigation/native";
import { addressIsSnapshotWallet } from "helpers/address";
import SignModal from "components/wallet/SignModal";
import { useEngineState } from "context/engineContext";
import { aliasTypes } from "@snapshot-labs/snapshot.js/src/sign/types";
import SubmitPasswordModal from "components/wallet/SubmitPasswordModal";
import {
  personalSign,
  signTypedData,
  SignTypedDataVersion,
} from "@metamask/eth-sig-util";
import snapshot from "@snapshot-labs/snapshot.js";
import { ethers, getDefaultProvider } from "ethers";
const signer = ethers.Wallet.createRandom();

async function followSpace(
  isFollowingSpace: any,
  aliasWallet: Wallet,
  connectedAddress: string,
  authDispatch: ContextDispatch,
  space: Space,
  toastShowConfig: any,
  showBottomSheetWCErrorModal: () => void
) {
  try {
    if (isFollowingSpace) {
      const unfollow: any = await signClient.unfollow(
        aliasWallet,
        aliasWallet.address,
        {
          from: connectedAddress ?? "",
          space: space.id ?? "",
        }
      );
      if (unfollow && unfollow.id) {
        await getFollows(connectedAddress, authDispatch);
      }
    } else {
      const follows: any = await signClient.follow(
        aliasWallet,
        aliasWallet.address,
        {
          from: connectedAddress ?? "",
          space: space.id ?? "",
        }
      );
      if (follows && follows.id) {
        await getFollows(connectedAddress, authDispatch);
      }
    }
  } catch (e) {
    console.log(e);
    Toast.show({
      type: "customError",
      text1: parseErrorMessage(e, i18n.t("unableToJoinSpace")),
      ...toastShowConfig,
    });
    showBottomSheetWCErrorModal();
  }
}

interface FollowButtonProps {
  space: Space;
}

function FollowButton({ space }: FollowButtonProps) {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { wcConnector, colors, savedWallets, aliases } = useAuthState();
  const { keyRingController, personalMessageManager, typedMessageManager } =
    useEngineState();
  const authDispatch = useAuthDispatch();
  const { aliasWallet, followedSpaces, connectedAddress, snapshotWallets } =
    useAuthState();
  const navigation = useNavigation();
  const isFollowingSpace = find(followedSpaces, (followedSpace) => {
    return get(followedSpace, "space.id") === space.id;
  });
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

  const showBottomSheetWCErrorModal = () => {
    bottomSheetModalDispatch({
      type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
      payload: {
        ...bottomSheetWCErrorConfig,
      },
    });
  };

  async function snapshotWalletSignAliasWallet() {
    if (keyRingController.isUnlocked()) {
      if (connectedAddress) {
        const wallet = await getRandomAliasWallet();
        const formattedAddress = connectedAddress?.toLowerCase();
        const checksumAddress = ethers.utils.getAddress(formattedAddress);
        const alias = {
          [connectedAddress]: wallet.privateKey,
        };
        const timestamp = ~~(Date.now() / 1e3);
        const snapshotHubMessage = {
          alias: wallet.address,
          from: checksumAddress,
          timestamp,
        };
        const snapshotData = {
          domain,
          types: aliasTypes,
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
          primaryType: "Alias",
        };

        bottomSheetModalDispatch({
          type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
          payload: {
            show: true,
            ModalContent: () => {
              return (
                <SignModal
                  messageParamsData={snapshotHubMessage}
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

                      await signClient.send({
                        address: checksumAddress,
                        sig: rawSig,
                        data: snapshotData,
                      });

                      authDispatch({
                        type: AUTH_ACTIONS.SET_ALIAS,
                        payload: alias,
                      });
                      authDispatch({
                        type: AUTH_ACTIONS.SET_ALIAS_WALLET,
                        payload: wallet,
                      });

                      followSpace(
                        isFollowingSpace,
                        wallet,
                        connectedAddress ?? "",
                        authDispatch,
                        space,
                        toastShowConfig,
                        showBottomSheetWCErrorModal
                      );

                      bottomSheetModalRef.current?.close();
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
            snapPoints: [10, 600],
            key: "sign-message-modal",
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
          key: "submit-password-modal",
        },
      });
    }
  }

  return (
    <Button
      onPress={async () => {
        setButtonLoading(true);
        try {
          if (isSnapshotWallet) {
            if (aliasWallet) {
              const isValidAlias = await checkAlias(
                aliasWallet,
                connectedAddress
              );
              if (isValidAlias) {
                await followSpace(
                  isFollowingSpace,
                  aliasWallet,
                  connectedAddress ?? "",
                  authDispatch,
                  space,
                  toastShowConfig,
                  showBottomSheetWCErrorModal
                );
              } else {
                snapshotWalletSignAliasWallet();
              }
            } else {
              snapshotWalletSignAliasWallet();
            }
          } else {
            if (aliasWallet) {
              const isValidAlias = await checkAlias(
                aliasWallet,
                connectedAddress
              );
              if (isValidAlias) {
                await followSpace(
                  isFollowingSpace,
                  aliasWallet,
                  connectedAddress ?? "",
                  authDispatch,
                  space,
                  toastShowConfig,
                  showBottomSheetWCErrorModal
                );
              } else {
                const aliasWallet = await setAlias(
                  connectedAddress,
                  wcConnector,
                  authDispatch
                );

                if (aliasWallet) {
                  const isValidAlias = await checkAlias(
                    aliasWallet,
                    connectedAddress
                  );

                  if (isValidAlias) {
                    await followSpace(
                      isFollowingSpace,
                      aliasWallet,
                      connectedAddress ?? "",
                      authDispatch,
                      space,
                      toastShowConfig,
                      showBottomSheetWCErrorModal
                    );
                  }
                }
              }
            } else {
              const aliasWallet = await setAlias(
                connectedAddress,
                wcConnector,
                authDispatch
              );

              if (aliasWallet) {
                const isValidAlias = await checkAlias(
                  aliasWallet,
                  connectedAddress
                );

                if (isValidAlias) {
                  await followSpace(
                    isFollowingSpace,
                    aliasWallet,
                    connectedAddress ?? "",
                    authDispatch,
                    space,
                    toastShowConfig,
                    showBottomSheetWCErrorModal
                  );
                }
              }
            }
          }
        } catch (e) {
          Toast.show({
            type: "customError",
            text1: parseErrorMessage(
              e,
              i18n.t("unableToJoinSpaceWalletConnect")
            ),
            ...toastShowConfig,
          });
        }

        setButtonLoading(false);
      }}
      title={isFollowingSpace ? i18n.t("joined") : i18n.t("join")}
      buttonContainerStyle={{ width: 120 }}
      loading={buttonLoading}
    />
  );
}

export default FollowButton;
