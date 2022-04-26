import React, { useState } from "react";
import { View } from "react-native";
import { ethers } from "ethers";
import { getSnapshotDataForSign } from "helpers/snapshotWalletUtils";
import signClient from "helpers/signClient";
import { getSubscriptions, parseErrorMessage } from "helpers/apiUtils";
import i18n from "i18n-js";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from 'react-native-paper';
import { useAuthDispatch, useAuthState } from "context/authContext";
import { useEngineState } from "context/engineContext";
import { addressIsSnapshotWallet } from "helpers/address";
import { useToastShowConfig } from "constants/toast";
import { Space } from "types/explore";
import { sendEIP712 } from "helpers/EIP712";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import SubmitPasswordModal from "components/wallet/SubmitPasswordModal";
import { useNavigation } from "@react-navigation/native";
import IconButton from "components/IconButton";

interface SubscribeToSpaceButtonProps {
  space: Space;
}

function SubscribeToSpaceButton({ space }: SubscribeToSpaceButtonProps) {
  const {
    colors,
    connectedAddress,
    snapshotWallets,
    subscriptions,
    isWalletConnect,
    wcConnector,
  } = useAuthState();
  const { typedMessageManager, keyRingController } = useEngineState();
  const [loading, setLoading] = useState(false);
  const isSnapshotWallet = addressIsSnapshotWallet(
    connectedAddress ?? "",
    snapshotWallets
  );
  const authDispatch = useAuthDispatch();
  const toastShowConfig = useToastShowConfig();
  const isSubscribed = subscriptions[space?.id] !== undefined;
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const navigation: any = useNavigation();

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="small" color={colors.textColor} />
      </View>
    );
  }

  return (
    <IconButton
      onPress={async () => {
        try {
          setLoading(true);

          if (isSnapshotWallet) {
            if (keyRingController.isUnlocked()) {
              const formattedAddress = connectedAddress?.toLowerCase() ?? "";
              const checksumAddress = ethers.utils.getAddress(formattedAddress);
              const { snapshotData, signData } = getSnapshotDataForSign(
                checksumAddress,
                isSubscribed ? "unsubscribe" : "subscribe",
                {},
                space
              );

              const messageId = await typedMessageManager.addUnapprovedMessage(
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

              typedMessageManager.setMessageStatusSigned(messageId, rawSig);

              await signClient.send({
                address: checksumAddress,
                sig: rawSig,
                data: snapshotData,
              });

              await getSubscriptions(connectedAddress, authDispatch);

              Toast.show({
                type: "customSuccess",
                text1: i18n.t(
                  isSubscribed ? "unsubscribedToSpace" : "subscribedToSpace",
                  {
                    space: space?.name ?? "space",
                  }
                ),
                ...toastShowConfig,
              });
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
          } else if (isWalletConnect) {
            const checksumAddress = ethers.utils.getAddress(
              connectedAddress ?? ""
            );
            const sign = await sendEIP712(
              wcConnector,
              checksumAddress ?? "",
              space,
              isSubscribed ? "unsubscribe" : "subscribe",
              {}
            );

            if (sign) {
              await getSubscriptions(connectedAddress, authDispatch);
              Toast.show({
                type: "customSuccess",
                text1: i18n.t(
                  isSubscribed ? "unsubscribedToSpace" : "subscribedToSpace",
                  {
                    space: space?.name ?? "space",
                  }
                ),
                ...toastShowConfig,
              });
            } else {
              Toast.show({
                type: "customError",
                text1: i18n.t(
                  isSubscribed
                    ? "unableToUnsubscribeToSpace"
                    : "unableToSubscribeToSpace",
                  {
                    space: space?.name ?? "space",
                  }
                ),
                ...toastShowConfig,
              });
            }
          }
        } catch (e) {
          Toast.show({
            type: "customError",
            text1: parseErrorMessage(
              e,
              i18n.t(
                isSubscribed
                  ? "unableToUnsubscribeToSpace"
                  : "unableToSubscribeToSpace",
                {
                  space: space?.name ?? "space",
                }
              )
            ),
            ...toastShowConfig,
          });
        }
        setLoading(false);
      }}
      name={isSubscribed ? "notifications_active" : "notifications-none"}
      iconSize={18}
    />
  );
}

export default SubscribeToSpaceButton;
