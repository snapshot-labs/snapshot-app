import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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

interface FollowUserButton {
  followAddress: string;
}

function FollowUserButton({ followAddress }: FollowUserButton) {
  const { colors, connectedAddress } = useAuthState();
  const { keyRingController, typedMessageManager } = useEngineState();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={async () => {
        try {
          if (keyRingController.isUnlocked()) {
            const checksumAddress = ethers.utils.getAddress(
              connectedAddress ?? ""
            );
            const { snapshotData, signData } = getSnapshotDataForSign(
              checksumAddress,
              "followWallet",
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

            const sig = await signClient.send({
              address: checksumAddress,
              sig: rawSig,
              data: snapshotData,
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
        } catch (e) {
          console.log("FOLOW ERRRO", e);
        }
      }}
    >
      <View
        style={{
          borderRadius: 30,
          borderWidth: 1,
          paddingHorizontal: 30,
          paddingVertical: 16,
          borderColor: colors.bgBlue,
        }}
      >
        <Text
          style={{
            fontFamily: "Calibre-Medium",
            fontSize: 18,
            color: colors.textColor,
            textTransform: "uppercase",
          }}
        >
          {i18n.t("follow")}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default FollowUserButton;
