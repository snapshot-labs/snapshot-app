import React, { useState } from "react";
import { useAuthState } from "context/authContext";
import i18n from "i18n-js";
import { getSnapshotDataForSign } from "helpers/snapshotWalletUtils";
import { ethers } from "ethers";
import { useEngineState } from "context/engineContext";
import signClient from "helpers/signClient";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import SubmitPasswordModal from "components/wallet/SubmitPasswordModal";
import { useNavigation } from "@react-navigation/core";
import SecondaryButton from "components/SecondaryButton";

interface FollowUserButton {
  followAddress: string;
  getFollowers: () => void;
  walletFollowers: any[];
}

function FollowUserButton({
  followAddress,
  getFollowers,
  walletFollowers,
}: FollowUserButton) {
  const { connectedAddress } = useAuthState();
  const { keyRingController, typedMessageManager } = useEngineState();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const isFollowing = walletFollowers.find((walletFollow) => {
    return (
      walletFollow.follower.toLowerCase() === connectedAddress?.toLowerCase()
    );
  });

  return (
    <SecondaryButton
      onPress={async () => {
        try {
          if (keyRingController.isUnlocked()) {
            setLoading(true);
            const checksumAddress = ethers.utils.getAddress(
              connectedAddress ?? ""
            );
            const { snapshotData, signData } = getSnapshotDataForSign(
              checksumAddress,
              isFollowing !== undefined ? "unfollowWallet" : "followWallet",
              { wallet: followAddress }
            );

            const messageId = await typedMessageManager.addUnapprovedMessage(
              {
                data: JSON.stringify(signData),
                from: checksumAddress,
              },
              { origin: "snapshot.org" }
            );
            const cleanMessageParams = await typedMessageManager.approveMessage(
              {
                ...signData,
                metamaskId: messageId,
              }
            );
            const rawSig = await keyRingController.signTypedMessage(
              {
                data: JSON.stringify(cleanMessageParams),
                from: checksumAddress,
              },
              "V4"
            );
            typedMessageManager.setMessageStatusSigned(messageId, rawSig);

            await signClient.send({
              address: checksumAddress,
              sig: rawSig,
              data: snapshotData,
            });

            getFollowers();
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
        } catch (e) {
          console.log("FOLOW ERRRO", e);
        }
        setLoading(false);
      }}
      title={isFollowing !== undefined ? i18n.t("unfollow") : i18n.t("follow")}
      loading={loading}
    />
  );
}

export default FollowUserButton;
