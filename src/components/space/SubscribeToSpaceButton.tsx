import React, { useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ethers } from "ethers";
import { getSnapshotDataForSign } from "helpers/snapshotWalletUtils";
import signClient from "helpers/signClient";
import { getSubscriptions, parseErrorMessage } from "helpers/apiUtils";
import i18n from "i18n-js";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import IconFont from "components/IconFont";
import { useAuthDispatch, useAuthState } from "context/authContext";
import { useEngineState } from "context/engineContext";
import { addressIsSnapshotWallet } from "helpers/address";
import { useToastShowConfig } from "constants/toast";
import { Space } from "types/explore";
import { sendEIP712 } from "helpers/EIP712";

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

  return (
    <TouchableOpacity
      onPress={async () => {
        try {
          setLoading(true);

          if (isSnapshotWallet) {
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
              Toast.show({
                type: "customSuccess",
                text1: isSubscribed
                  ? "unsubscribedToSpace"
                  : "subscribedToSpace",
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
    >
      <View style={{ marginRight: 16 }}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.textColor} />
        ) : (
          <IconFont
            name={isSubscribed ? "notifications_active" : "notifications-none"}
            size={30}
            color={colors.textColor}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default SubscribeToSpaceButton;
