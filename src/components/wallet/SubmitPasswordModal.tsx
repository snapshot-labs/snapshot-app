import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import i18n from "i18n-js";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";
import common from "styles/common";
import Button from "components/Button";
import fontStyles from "styles/fonts";
import { useEngineState } from "context/engineContext";
import TextInput from "components/TextInput";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import ResetWalletModal from "components/wallet/ResetWalletModal";

const styles = StyleSheet.create({
  hintLabel: {
    fontSize: 18,
    marginBottom: 12,
    marginLeft: "auto",
    ...fontStyles.normal,
  },
  error: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
  },
});

interface SubmitPasswordModalProps {
  onClose: () => void;
  navigation: any;
}

function SubmitPasswordModal({
  onClose,
  navigation,
}: SubmitPasswordModalProps) {
  const { colors } = useAuthState();
  const { keyRingController } = useEngineState();
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState<undefined | string>(undefined);
  const [loading, setLoading] = useState(false);
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();

  return (
    <View>
      <View
        style={[
          common.modalHeader,
          {
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <Text
          style={[common.h3, { textAlign: "center", color: colors.textColor }]}
        >
          {i18n.t("enterPassword")}
        </Text>

        <TouchableOpacity
          onPress={() => {
            onClose();
          }}
          style={{ marginLeft: "auto" }}
        >
          <IconFont name="close" size={20} color={colors.darkGray} />
        </TouchableOpacity>
      </View>
      <View style={{ paddingTop: 16, paddingHorizontal: 16 }}>
        <View>
          <Text
            style={[styles.hintLabel, { color: colors.textColor }]}
            onPress={() => {
              setSecureTextEntry(!secureTextEntry);
            }}
          >
            {i18n.t(secureTextEntry ? "show" : "hide")}
          </Text>
        </View>
        <TextInput
          value={password}
          onChangeText={(text: string) => {
            setPassword(text);
          }}
          secureTextEntry={secureTextEntry}
          placeholder=""
          returnKeyType="next"
          autoCapitalize="none"
        />
        <View style={{ marginTop: 16 }}>
          {error && (
            <Text style={[styles.error, { color: colors.red }]}>{error}</Text>
          )}
        </View>
        <View style={{ marginTop: 16 }}>
          <Button
            loading={loading}
            onPress={async () => {
              try {
                setLoading(true);
                await keyRingController.submitPassword(password);
                setLoading(false);
                onClose();
              } catch (e) {
                setLoading(false);
                setError(
                  i18n.t("reveal_credential.warning_incorrect_password")
                );
              }
            }}
            title={i18n.t("submitPassword")}
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            bottomSheetModalDispatch({
              type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
              payload: {
                snapPoints: [10, 600],
                initialIndex: 1,
                ModalContent: () => {
                  return (
                    <ResetWalletModal
                      onClose={() => {
                        bottomSheetModalRef.current?.close();
                      }}
                      navigation={navigation}
                    />
                  );
                },
                show: true,
                key: "reset-wallet-modal",
              },
            });
          }}
        >
          <View style={{ marginTop: 50, paddingLeft: 16 }}>
            <Text style={[common.h4, { color: colors.red }]}>
              {i18n.t("resetWallet")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default SubmitPasswordModal;
