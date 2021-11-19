import React, { useState } from "react";
import Button from "./Button";
import { useAuthDispatch, useAuthState } from "../context/authContext";
import { Wallet } from "@ethersproject/wallet";
import signClient from "../helpers/signClient";
import "@ethersproject/shims";
import { checkAlias, setAlias } from "../helpers/aliasUtils";
import find from "lodash/find";
import i18n from "i18n-js";
import get from "lodash/get";
import { getFollows } from "../helpers/apiUtils";
import { ContextDispatch } from "../types/context";
import { Space } from "../types/explore";

async function followSpace(
  isFollowingSpace: any,
  aliasWallet: Wallet,
  connectedAddress: string,
  authDispatch: ContextDispatch,
  space: Space
) {
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
}

type FollowButtonProps = {
  space: Space;
};

function FollowButton({ space }: FollowButtonProps) {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { wcConnector } = useAuthState();
  const authDispatch = useAuthDispatch();
  const { aliasWallet, followedSpaces, connectedAddress } = useAuthState();
  const isFollowingSpace = find(followedSpaces, (followedSpace) => {
    return get(followedSpace, "space.id") === space.id;
  });

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
                space
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
                    space
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
                  space
                );
              }
            }
          }
        } catch (e) {
          console.log(e);
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
