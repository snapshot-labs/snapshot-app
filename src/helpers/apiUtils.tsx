import { ContextDispatch } from "types/context";
import Toast from "react-native-toast-message";
import get from "lodash/get";
import { AUTH_ACTIONS } from "context/authContext";
import { sendEIP712 } from "helpers/EIP712";
import i18n from "i18n-js";
import { Proposal } from "types/proposal";
import { Space } from "types/explore";
import { FOLLOWS_QUERY } from "./queries";
import apolloClient from "./apolloClient";
import { addressIsSnapshotWallet } from "helpers/address";
import { ethers } from "ethers";
import { getSnapshotDataForSign } from "helpers/snapshotWalletUtils";
import signClient from "helpers/signClient";

export const defaultHeaders = {
  accept: "application/json; charset=utf-8",
  "content-type": "application/json; charset=utf-8",
};

export async function getFollows(
  accountId: string | null | undefined,
  authDispatch?: ContextDispatch,
  setLoading?: (loading: boolean) => void
) {
  if (accountId) {
    const query = {
      query: FOLLOWS_QUERY,
      variables: {
        follower_in: accountId,
      },
    };
    const result = await apolloClient.query(query);
    const followedSpaces = get(result, "data.follows", []);

    if (authDispatch) {
      authDispatch({
        type: AUTH_ACTIONS.SET_FOLLOWED_SPACES,
        payload: followedSpaces,
      });
    }
  }
  if (setLoading) {
    setLoading(false);
  }
}

export function parseErrorMessage(e: any, defaultErrorMessage: string) {
  let errorMessage = defaultErrorMessage;
  if (e.error && e.error_description) {
    errorMessage = `${e.error}: ${e.error_description}`;
  }

  return errorMessage;
}

export async function deleteProposal(
  wcConnector: any,
  connectedAddress: string,
  space: Space,
  proposal: Proposal,
  authDispatch: any,
  toastShowConfig: any,
  navigation: any,
  snapshotWallets: string[],
  keyRingController: any,
  typedMessageManager: any
) {
  const isSnapshotWallet = addressIsSnapshotWallet(
    connectedAddress ?? "",
    snapshotWallets
  );

  try {
    if (isSnapshotWallet) {
      const formattedAddress = connectedAddress?.toLowerCase();
      const checksumAddress = ethers.utils.getAddress(formattedAddress);
      const { snapshotData, signData } = getSnapshotDataForSign(
        checksumAddress,
        "vote",
        {
          proposal: {
            id: proposal.id,
          },
        },
        space
      );
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
          text1: i18n.t("proposalDeleted"),
          ...toastShowConfig,
        });
        authDispatch({
          type: AUTH_ACTIONS.SET_REFRESH_FEED,
          payload: {
            spaceId: space.id,
          },
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "customError",
          text1: i18n.t("unableToDeleteProposal"),
          ...toastShowConfig,
        });
      }
    } else {
      const sign = await sendEIP712(
        wcConnector,
        connectedAddress,
        space,
        "delete-proposal",
        {
          proposal: {
            id: proposal.id,
          },
        }
      );

      if (sign) {
        Toast.show({
          type: "customSuccess",
          text1: i18n.t("proposalDeleted"),
          ...toastShowConfig,
        });
        authDispatch({
          type: AUTH_ACTIONS.SET_REFRESH_FEED,
          payload: {
            spaceId: space.id,
          },
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "customError",
          text1: i18n.t("unableToDeleteProposal"),
          ...toastShowConfig,
        });
      }
    }
  } catch (e) {
    Toast.show({
      type: "customError",
      text1: i18n.t("unableToDeleteProposal"),
      ...toastShowConfig,
    });
  }
}

export function isAdmin(connectedAddress: string, space: Space) {
  const admins = (space?.admins || []).map((admin: string) =>
    admin.toLowerCase()
  );
  return admins.includes(connectedAddress.toLowerCase());
}
