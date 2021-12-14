import React, { useState } from "react";
import Button from "./Button";
import { useAuthDispatch, useAuthState } from "context/authContext";
import { Wallet } from "@ethersproject/wallet";
import signClient from "helpers/signClient";
import "@ethersproject/shims";
import { checkAlias, setAlias } from "helpers/aliasUtils";
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
  const authDispatch = useAuthDispatch();
  const { aliasWallet, followedSpaces, connectedAddress } = useAuthState();
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
  const showBottomSheetWCErrorModal = () => {
    bottomSheetModalDispatch({
      type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
      payload: {
        ...bottomSheetWCErrorConfig,
      },
    });
  };

  return (
    <Button
      onPress={async () => {
        setButtonLoading(true);
        try {
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
