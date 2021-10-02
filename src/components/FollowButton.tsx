import React, { useEffect, useState } from "react";
import Button from "./Button";
import { useAuthDispatch, useAuthState } from "../context/authContext";
import { Wallet } from "@ethersproject/wallet";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import signClient from "../util/signClient";
import { Platform } from "react-native";
import SendIntentAndroid from "react-native-send-intent";
import "@ethersproject/shims";
import { checkAlias, setAlias } from "../util/aliasUtils";
import WalletConnect from "@walletconnect/client";
import find from "lodash/find";
import i18n from "i18n-js";
import get from "lodash/get";
import { getFollows } from "../util/apiUtils";
import { ContextDispatch } from "../types/context";
import { Space } from "../types/explore";

function setConnectorOnConnect(
  connector: WalletConnect,
  androidAppUrl: string | null,
  didSetConnectorOnConnect: boolean,
  setDidSetConnectorOnConnect: (didSetConnectorOnConnect: boolean) => void
) {
  if (!didSetConnectorOnConnect && Platform.OS === "android") {
    if (connector) {
      connector.off("call_request_sent");
      connector.on("call_request_sent", async (error) => {
        if (androidAppUrl) {
          const createdUri = `wc:${connector.handshakeTopic}@1`;
          SendIntentAndroid.openAppWithData(androidAppUrl, createdUri);
        }
      });

      setDidSetConnectorOnConnect(true);
    }
  }
}

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
  const authDispatch = useAuthDispatch();
  const connector = useWalletConnect();
  const [didSetConnectorOnConnect, setDidSetConnectorOnConnect] =
    useState(false);
  const { aliasWallet, androidAppUrl, followedSpaces, connectedAddress } =
    useAuthState();
  const isFollowingSpace = find(followedSpaces, (followedSpace) => {
    return get(followedSpace, "space.id") === space.id;
  });

  useEffect(() => {
    setConnectorOnConnect(
      connector,
      androidAppUrl,
      didSetConnectorOnConnect,
      setDidSetConnectorOnConnect
    );
  }, [connector]);

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
                connector,
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
              connector,
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
