import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet, Switch } from "react-native";
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
import storage from "helpers/storage";
import Device from "helpers/device";
import SecureKeychain from "helpers/secureKeychain";

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
  biometrics: {
    position: "relative",
    marginTop: 20,
    marginBottom: 30,
  },
  biometryLabel: {
    fontSize: 18,
    marginTop: 2,
    ...fontStyles.normal,
    marginLeft: "auto",
    marginRight: 60,
  },
  biometrySwitch: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  biometricsContainer: {
    justifyContent: "center",
  },
});

const IOS_DENY_BIOMETRIC_ERROR =
  "The user name or passphrase you entered is not correct.";

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
  const [biometryType, setBiometryType] = useState<string | null>(null);
  const [biometryChoice, setBiometryChoice] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function checkBiometryType() {
    const biometryType = await SecureKeychain.getSupportedBiometryType();
    if (biometryType) {
      setBiometryType(Device.isAndroid() ? "biometrics" : biometryType);
      setBiometryChoice(true);
    }
  }

  async function tryBiometrics() {
    try {
      const biometryChoice = await storage.load(storage.KEYS.biometryChoice);
      const rememberMe = await storage.load(storage.KEYS.rememberMe);
      if (biometryChoice === storage.VALUES.true) {
        setLoading(true);
        const credentials = await SecureKeychain.getGenericPassword();
        if (!credentials) {
          setLoading(false);
          return;
        }
        await keyRingController.submitPassword(credentials.password);
        setLoading(false);
        onClose();
      } else if (rememberMe) {
        setLoading(true);
        const credentials = await SecureKeychain.getGenericPassword();
        if (!credentials) {
          setLoading(false);
          return;
        }
        await keyRingController.submitPassword(credentials.password);
        setLoading(false);
        onClose();
      } else {
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      setError(i18n.t("reveal_credential.warning_incorrect_password"));
    }
  }

  useEffect(() => {
    checkBiometryType();
    tryBiometrics();
  }, []);

  async function handleRejectedOsBiometricPrompt(error: Error) {
    const biometryType = await SecureKeychain.getSupportedBiometryType();
    if (error.toString().includes(IOS_DENY_BIOMETRIC_ERROR) && !biometryType) {
      setBiometryType(biometryType);
      setBiometryChoice(true);
      throw Error(i18n.t("disableBiometricError"));
    }
  }

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
        <View style={styles.biometrics}>
          {biometryType !== null ? (
            <View style={styles.biometricsContainer}>
              <Text style={[styles.biometryLabel, { color: colors.textColor }]}>
                {i18n.t(`biometrics.enable_${biometryType?.toLowerCase()}`)}
              </Text>
              <Switch
                onValueChange={async (biometryChoice: boolean) => {
                  setBiometryChoice(biometryChoice);
                }} // eslint-disable-line react/jsx-no-bind
                value={biometryChoice}
                style={styles.biometrySwitch}
                trackColor={
                  Device.isIos()
                    ? { true: colors.bgGreen, false: colors.darkGray }
                    : null
                }
                ios_backgroundColor={colors.darkGray}
              />
            </View>
          ) : (
            <View style={styles.biometricsContainer}>
              <Text style={[styles.biometryLabel, { color: colors.textColor }]}>
                {i18n.t("choosePasswordRememberMe")}
              </Text>
              <Switch
                onValueChange={(rememberMe) => {
                  setRememberMe(rememberMe);
                }} // eslint-disable-line react/jsx-no-bind
                value={rememberMe}
                style={styles.biometrySwitch}
                trackColor={
                  Device.isIos()
                    ? { true: colors.bgGreen, false: colors.darkGray }
                    : null
                }
                ios_backgroundColor={colors.darkGray}
              />
            </View>
          )}
        </View>
        <View style={{ marginTop: 16 }}>
          <Button
            loading={loading}
            onPress={async () => {
              try {
                setLoading(true);
                await keyRingController.submitPassword(password);
                if (biometryType && biometryChoice) {
                  try {
                    await SecureKeychain.setGenericPassword(
                      password,
                      SecureKeychain.TYPES.BIOMETRICS
                    );
                  } catch (error) {
                    if (Device.isIos())
                      await handleRejectedOsBiometricPrompt(error);
                    throw error;
                  }
                } else if (rememberMe) {
                  await SecureKeychain.setGenericPassword(
                    password,
                    SecureKeychain.TYPES.REMEMBER_ME
                  );
                } else {
                  storage.remove(storage.KEYS.rememberMe);
                  storage.remove(storage.KEYS.biometryChoice);
                }

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
