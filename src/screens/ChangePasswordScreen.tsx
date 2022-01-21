import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import i18n from "i18n-js";
import zxcvbn from "zxcvbn";
import IconFont from "components/IconFont";
import Device from "helpers/device";
import { getPasswordStrengthWord, MIN_PASSWORD_LENGTH } from "helpers/password";
import storage from "helpers/storage";
import CheckBox from "@react-native-community/checkbox";
import Button from "components/Button";
import TextInput from "components/TextInput";
import { useAuthState } from "context/authContext";
import colors from "constants/colors";
import fontStyles from "styles/fonts";
import { SafeAreaView } from "react-native-safe-area-context";
import common from "styles/common";
import BackButton from "components/BackButton";
import { useEngineState } from "context/engineContext";
import { syncPrefs } from "helpers/importAdditionalAccounts";
import SecureKeychain from "helpers/secureKeychain";
import Toast from "react-native-toast-message";
import { useToastShowConfig } from "constants/toast";
import { useNavigation } from "@react-navigation/native";
import toString from "lodash/toString";
import { HOME_SCREEN } from "constants/navigation";

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginBottom: 10,
    marginTop: 24,
  },
  scrollableWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  keyboardScrollableWrapper: {
    flexGrow: 1,
  },
  content: {
    textAlign: "center",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 23,
    color: colors.textColor,
    marginTop: 16,
    ...fontStyles.normal,
  },
  text: {
    marginBottom: 10,
    justifyContent: "center",
    ...fontStyles.normal,
  },
  checkboxContainer: {
    marginTop: 10,
    marginHorizontal: 10,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  checkbox: {
    width: 18,
    height: 18,
    margin: 10,
    marginTop: -5,
  },
  label: {
    ...fontStyles.normal,
    fontSize: 16,
    color: colors.black,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  field: {
    marginVertical: 5,
    position: "relative",
  },
  ctaWrapper: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  errorMsg: {
    color: colors.red,
    ...fontStyles.normal,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  biometrics: {
    position: "relative",
    marginTop: 20,
    marginBottom: 30,
  },
  biometryLabel: {
    flex: 1,
    fontSize: 18,
    marginTop: 8,
    color: colors.black,
    ...fontStyles.normal,
  },
  biometrySwitch: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  biometricsContainer: {
    justifyContent: "center",
  },
  hintLabel: {
    fontSize: 18,
    marginBottom: 12,
    ...fontStyles.normal,
  },
  passwordStrengthLabel: {
    height: 20,
    marginTop: 16,
    fontSize: 16,
    ...fontStyles.normal,
  },
  showPassword: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  strength_weak: {
    color: colors.red,
  },
  strength_good: {
    color: colors.yellow,
  },
  strength_strong: {
    color: colors.bgGreen,
  },
  showMatchingPasswords: {
    position: "absolute",
    top: 52,
    right: 17,
    alignSelf: "flex-end",
  },
});

function ChangePasswordScreen() {
  const { keyRingController, preferencesController } = useEngineState();
  const { connectedAddress } = useAuthState();
  const { colors } = useAuthState();
  const [isSelected, setIsSelected] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureTextEntryCurrentPassword, setSecureTextEntryCurrentPassword] =
    useState(true);
  const [biometryType, setBiometryType] = useState<string | null>(null);
  const [biometryChoice, setBiometryChoice] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const passwordStrengthWord = getPasswordStrengthWord(passwordStrength);
  const confirmPasswordInputRef = useRef(null);
  const newPasswordInputRef = useRef(null);
  const passwordsMatch = password !== "" && password === confirmPassword;
  const canSubmit = passwordsMatch && isSelected;
  const toastShowConfig = useToastShowConfig();
  const navigation: any = useNavigation();

  async function checkBiometryType() {
    if (Device.isIos()) {
      const biometryType = await SecureKeychain.getSupportedBiometryType();
      if (biometryType) {
        setBiometryType(Device.isAndroid() ? "biometrics" : biometryType);
        setBiometryChoice(true);
      }
    }
  }

  async function recreateVault() {
    try {
      await keyRingController.submitPassword(currentPassword);
    } catch (e) {
      throw new Error(i18n.t("reveal_credential.warning_incorrect_password"));
    }
    const mnemonic = await keyRingController.exportSeedPhrase(currentPassword);
    const seedPhrase = JSON.stringify(mnemonic).replace(/"/g, "");
    const oldPrefs = preferencesController.state;

    let importedAccounts: any = [];
    try {
      const keychainPassword = currentPassword;
      // Get imported accounts
      const simpleKeyrings = keyRingController.state.keyrings.filter(
        (keyring) => keyring.type === "Simple Key Pair"
      );
      for (let i = 0; i < simpleKeyrings.length; i++) {
        const simpleKeyring = simpleKeyrings[i];
        const simpleKeyringAccounts = await Promise.all(
          simpleKeyring.accounts.map((account) =>
            keyRingController.exportAccount(keychainPassword, account)
          )
        );
        importedAccounts = [...importedAccounts, ...simpleKeyringAccounts];
      }
    } catch (e) {}

    // Recreate keyring with password given to this method
    const newKeyringState = await keyRingController.createNewVaultAndRestore(
      password,
      seedPhrase
    );

    // Get props to restore vault
    const hdKeyring = keyRingController.state.keyrings[0];
    const existingAccountCount = hdKeyring.accounts.length;
    const selectedAddress = connectedAddress;

    // Create previous accounts again
    for (let i = 0; i < existingAccountCount - 1; i++) {
      await keyRingController.addNewAccount();
    }

    try {
      // Import imported accounts again
      for (let i = 0; i < importedAccounts.length; i++) {
        await keyRingController.importAccountWithStrategy("privateKey", [
          importedAccounts[i],
        ]);
      }
    } catch (e) {}

    //Persist old account/identities names
    const preferencesControllerState = preferencesController.state;
    const prefUpdates = syncPrefs(oldPrefs, preferencesControllerState);

    // Set preferencesControllerState again
    await preferencesController.update(prefUpdates);
    // Reselect previous selected account if still available
    if (hdKeyring.accounts.includes(selectedAddress)) {
      preferencesController.setSelectedAddress(selectedAddress);
    } else {
      preferencesController.setSelectedAddress(hdKeyring.accounts[0]);
    }

    return newKeyringState;
  }

  async function onPressChangePassword() {
    setLoading(true);
    setError(null);
    if (!canSubmit) return;
    if (loading) return;

    try {
      const keyRingControllState = await recreateVault();
      storage.save(
        storage.KEYS.keyRingControllerState,
        JSON.stringify(keyRingControllState)
      );
      storage.save(
        storage.KEYS.preferencesControllerState,
        JSON.stringify(preferencesController.state)
      );

      await SecureKeychain.resetGenericPassword();

      try {
        if (biometryType && biometryChoice) {
          await SecureKeychain.setGenericPassword(
            password,
            SecureKeychain.TYPES.BIOMETRICS
          );
        } else if (rememberMe) {
          await SecureKeychain.setGenericPassword(
            password,
            SecureKeychain.TYPES.REMEMBER_ME
          );
        }

        Toast.show({
          type: "customSuccess",
          text1: i18n.t("change_password.password_changed"),
          ...toastShowConfig,
        });
        setLoading(false);
        navigation.navigate(HOME_SCREEN, {
          screen: "More",
        });
      } catch (error) {}
    } catch (e) {
      const errorString =
        toString(e) ?? i18n.t("change_password.unable_to_change_password");
      setError(errorString);
    }

    setLoading(false);
  }

  useEffect(() => {
    checkBiometryType();
  });

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("change_password.title")} />
      </View>
      <KeyboardAwareScrollView
        style={styles.scrollableWrapper}
        contentContainerStyle={styles.keyboardScrollableWrapper}
        resetScrollToCoords={{ x: 0, y: 0 }}
      >
        <View>
          <View style={styles.content}>
            <View style={styles.text}>
              <Text style={[styles.subtitle, { color: colors.textColor }]}>
                {i18n.t("choosePasswordSubtitle")}
              </Text>
            </View>
          </View>
          <View style={styles.field}>
            <Text style={[styles.hintLabel, { color: colors.textColor }]}>
              {i18n.t("change_password.current_password")}
            </Text>
            <Text
              onPress={() => {
                setSecureTextEntryCurrentPassword(
                  !secureTextEntryCurrentPassword
                );
              }}
              style={[
                styles.hintLabel,
                styles.showPassword,
                { color: colors.textColor },
              ]}
            >
              {i18n.t(secureTextEntryCurrentPassword ? "show" : "hide")}
            </Text>
            <TextInput
              value={currentPassword}
              onChangeText={(text: string) => {
                setCurrentPassword(text);
              }}
              secureTextEntry={secureTextEntryCurrentPassword}
              placeholder=""
              onSubmitEditing={() => {
                if (newPasswordInputRef && newPasswordInputRef.current) {
                  newPasswordInputRef?.current?.focus();
                }
              }}
              returnKeyType="next"
              autoCapitalize="none"
            />
          </View>
          <View style={[styles.field, { marginTop: 28 }]}>
            <Text style={[styles.hintLabel, { color: colors.textColor }]}>
              {i18n.t("choosePasswordNewPassword")}
            </Text>
            <Text
              onPress={() => {
                setSecureTextEntry(!secureTextEntry);
              }}
              style={[
                styles.hintLabel,
                styles.showPassword,
                { color: colors.textColor },
              ]}
            >
              {i18n.t(secureTextEntry ? "show" : "hide")}
            </Text>
            <TextInput
              setRef={newPasswordInputRef}
              value={password}
              onChangeText={(text) => {
                const passInfo = zxcvbn(text);
                setPassword(text);
                setPasswordStrength(passInfo.score);
              }}
              secureTextEntry={secureTextEntry}
              placeholder=""
              onSubmitEditing={() => {
                if (
                  confirmPasswordInputRef &&
                  confirmPasswordInputRef.current
                ) {
                  confirmPasswordInputRef?.current?.focus();
                }
              }}
              returnKeyType="next"
              autoCapitalize="none"
            />
            {(password !== "" && (
              <Text
                style={[
                  styles.passwordStrengthLabel,
                  { color: colors.textColor },
                ]}
              >
                {i18n.t("choosePasswordPasswordStrength")}
                <Text
                  style={
                    styles[`strength_${passwordStrengthWord?.toLowerCase()}`]
                  }
                >
                  {" "}
                  {i18n.t(`choosePasswordStrength${passwordStrengthWord}`)}
                </Text>
              </Text>
            )) || <Text style={styles.passwordStrengthLabel} />}
          </View>
          <View style={styles.field}>
            <Text style={[styles.hintLabel, { color: colors.textColor }]}>
              {i18n.t("choosePasswordConfirmPassword")}
            </Text>
            <TextInput
              setRef={confirmPasswordInputRef}
              value={confirmPassword}
              onChangeText={(text: string) => {
                setConfirmPassword(text);
              }}
              secureTextEntry={secureTextEntry}
              placeholder={""}
              placeholderTextColor={colors.darkGray}
              returnKeyType={"done"}
              autoCapitalize="none"
            />
            <View style={styles.showMatchingPasswords}>
              {passwordsMatch ? (
                <IconFont
                  name="check"
                  size={24}
                  color={colors.bgGreen}
                  style={{
                    marginTop: Device.isIos() ? -10 : -7,
                  }}
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.passwordStrengthLabel,
                { color: colors.textColor },
              ]}
            >
              {i18n.t("choosePasswordMustBeAtLeast", {
                number: MIN_PASSWORD_LENGTH,
              })}
            </Text>
          </View>
          <View>
            <View style={styles.biometrics}>
              {biometryType !== null ? (
                <View style={styles.biometricsContainer}>
                  <Text
                    style={[styles.biometryLabel, { color: colors.textColor }]}
                  >
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
                  <Text
                    style={[styles.biometryLabel, { color: colors.textColor }]}
                  >
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
          </View>
          <View style={styles.checkboxContainer}>
            <CheckBox
              value={isSelected}
              onValueChange={() => {
                setIsSelected(!isSelected);
              }}
              style={styles.checkbox}
              tintColors={{
                true: colors.bgGreen,
                false: colors.borderColor,
              }}
              boxType="square"
              tintColor={colors.borderColor}
              onCheckColor={colors.bgGreen}
              onTintColor={colors.bgGreen}
            />
            <Text
              style={[styles.label, { color: colors.textColor }]}
              onPress={() => {
                setIsSelected(!isSelected);
              }}
            >
              {i18n.t("choosePasswordIUnderstand")}
            </Text>
          </View>

          {!!error && <Text style={styles.errorMsg}>{error}</Text>}
        </View>

        <View style={styles.ctaWrapper}>
          <Button
            onPress={onPressChangePassword}
            disabled={!canSubmit}
            title={i18n.t("change_password.title")}
            loading={loading}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

export default ChangePasswordScreen;
