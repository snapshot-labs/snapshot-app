import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import i18n from "i18n-js";
import Device from "helpers/device";
import fontStyles from "styles/fonts";
import colors from "constants/colors";
import { createChoosePasswordSteps } from "constants/onboarding";
import OnboardingProgress from "components/wallet/OnboardingProgress";
import Button from "components/Button";
import zxcvbn from "zxcvbn";
import CheckBox from "@react-native-community/checkbox";
import {
  getPasswordStrengthWord,
  MIN_PASSWORD_LENGTH,
  passwordRequirementsMet,
} from "helpers/password";
import storage from "helpers/storage";
import { ONBOARDING } from "constants/navigation";
import Engine from "helpers/engine";
import SecureKeychain from "helpers/secureKeychain";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";
import common from "styles/common";
import BackButton from "components/BackButton";

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginBottom: 10,
    marginTop: 24,
  },
  scrollableWrapper: {
    flex: 1,
    paddingHorizontal: 32,
  },
  keyboardScrollableWrapper: {
    flexGrow: 1,
  },
  loadingWrapper: {
    paddingHorizontal: 40,
    paddingBottom: 30,
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    width: Device.isIos() ? 90 : 80,
    height: Device.isIos() ? 90 : 80,
    marginTop: 30,
    marginBottom: 30,
  },
  image: {
    alignSelf: "center",
    width: 80,
    height: 80,
  },
  content: {
    textAlign: "center",
    alignItems: "center",
  },
  title: {
    fontSize: Device.isAndroid() ? 20 : 25,
    marginTop: 20,
    marginBottom: 20,
    color: colors.textColor,
    justifyContent: "center",
    textAlign: "center",
    ...fontStyles.bold,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.textColor,
    textAlign: "center",
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
    fontSize: 14,
    color: colors.black,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  field: {
    marginVertical: 5,
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderColor,
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    height: 50,
    ...fontStyles.normal,
  },
  ctaWrapper: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  errorMsg: {
    color: colors.red,
    ...fontStyles.normal,
  },
  biometrics: {
    position: "relative",
    marginTop: 20,
    marginBottom: 30,
  },
  biometryLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    ...fontStyles.normal,
  },
  biometrySwitch: {
    position: "absolute",
    top: 0,
    right: 0,
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

const PASSCODE_NOT_SET_ERROR = "Error: Passcode not set.";
const IOS_DENY_BIOMETRIC_ERROR =
  "The user name or passphrase you entered is not correct.";

interface ChoosePasswordScreenProps {
  route: {
    params: {
      previousScreen: string;
    };
  };
}

function ChoosePasswordScreen({ route }: ChoosePasswordScreenProps) {
  const { colors } = useAuthState();
  const CHOOSE_PASSWORD_STEPS = createChoosePasswordSteps();
  const [isSelected, setIsSelected] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [biometryType, setBiometryType] = useState(null);
  const [biometryChoice, setBiometryChoice] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputWidth, setInputWidth] = useState({ width: "99%" });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const passwordStrengthWord = getPasswordStrengthWord(passwordStrength);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const passwordsMatch = password !== "" && password === confirmPassword;
  const canSubmit = passwordsMatch && isSelected;
  const keyringControllerPasswordSetRef: any = useRef<boolean>(null);
  const previousScreen = route?.params?.previousScreen;

  async function updateBiometryChoice(biometryChoice: boolean = false) {
    if (!biometryChoice) {
      await storage.save(
        storage.KEYS.biometryChoiceDisabled,
        storage.VALUES.true
      );
    } else {
      await storage.remove(storage.KEYS.biometryChoiceDisabled);
    }
    setBiometryChoice(biometryChoice);
  }
  async function handleRejectedOsBiometricPrompt(error: Error) {
    const biometryType = await SecureKeychain.getSupportedBiometryType();
    if (error.toString().includes(IOS_DENY_BIOMETRIC_ERROR) && !biometryType) {
      setBiometryType(biometryType);
      setBiometryChoice(true);
      updateBiometryChoice();
      throw Error(i18n.t("disableBiometricError"));
    }
  }

  async function getSeedPhrase() {
    const { KeyringController } = Engine.context;
    const keychainPassword = keyringControllerPasswordSetRef.current
      ? password
      : "";
    const mnemonic = await KeyringController.exportSeedPhrase(keychainPassword);
    return JSON.stringify(mnemonic).replace(/"/g, "");
  }

  async function recreateVault(password: string) {
    const { KeyringController, PreferencesController } = Engine.context;
    const seedPhrase = await getSeedPhrase();

    let importedAccounts: any[] = [];
    try {
      const keychainPassword = keyringControllerPasswordSetRef.current
        ? password
        : "";
      // Get imported accounts
      const simpleKeyrings = KeyringController.state.keyrings.filter(
        (keyring: any) => keyring.type === "Simple Key Pair"
      );
      for (let i = 0; i < simpleKeyrings.length; i++) {
        const simpleKeyring = simpleKeyrings[i];
        const simpleKeyringAccounts = await Promise.all(
          simpleKeyring.accounts.map((account: string) =>
            KeyringController.exportAccount(keychainPassword, account)
          )
        );
        importedAccounts = [...importedAccounts, ...simpleKeyringAccounts];
      }
    } catch (e) {
      console.log(
        e,
        "error while trying to get imported accounts on recreate vault"
      );
    }

    // Recreate keyring with password given to this method
    await KeyringController.createNewVaultAndRestore(password, seedPhrase);
    // Keyring is set with empty password or not
    keyringControllerPasswordSetRef.current = password !== "";

    // Get props to restore vault
    const hdKeyring = KeyringController.state.keyrings[0];
    const existingAccountCount = hdKeyring.accounts.length;
    const selectedAddress = "CHANGE THIS LATER";
    let preferencesControllerState = PreferencesController.state;

    // Create previous accounts again
    for (let i = 0; i < existingAccountCount - 1; i++) {
      await KeyringController.addNewAccount();
    }

    try {
      // Import imported accounts again
      for (let i = 0; i < importedAccounts.length; i++) {
        await KeyringController.importAccountWithStrategy("privateKey", [
          importedAccounts[i],
        ]);
      }
    } catch (e) {
      console.log(e, "error while trying to import accounts on recreate vault");
    }

    // Reset preferencesControllerState
    preferencesControllerState = PreferencesController.state;

    // Set preferencesControllerState again
    await PreferencesController.update(preferencesControllerState);
    // Reselect previous selected account if still available
    if (hdKeyring.accounts.includes(selectedAddress)) {
      PreferencesController.setSelectedAddress(selectedAddress);
    } else {
      PreferencesController.setSelectedAddress(hdKeyring.accounts[0]);
    }
  }

  async function createNewVaultAndKeychain(password: string) {
    const { KeyringController } = Engine.context;
    await Engine.resetState();
    await KeyringController.createNewVaultAndKeychain(password);
    keyringControllerPasswordSetRef.current = true;
  }

  async function onPressCreate() {
    const passwordsMatch = password !== "" && password === confirmPassword;
    const canSubmit = passwordsMatch && isSelected;

    if (!canSubmit) return;
    if (loading) return;
    if (!passwordRequirementsMet(password)) {
      Alert.alert("Error", i18n.t("choosePasswordPasswordLengthError"));
      return;
    } else if (password !== confirmPassword) {
      Alert.alert("Error", i18n.t("choosePasswordPasswordDontMatch"));
      return;
    }

    try {
      setLoading(true);
      const previous_screen = route.params?.previousScreen;

      if (previous_screen === ONBOARDING) {
        await createNewVaultAndKeychain(password);
        // this.props.seedphraseNotBackedUp();
        await storage.remove(storage.KEYS.nextMakerReminder);
        await storage.save(storage.KEYS.existingUser, storage.VALUES.true);
        await storage.remove(storage.KEYS.seedPhraseHints);
      } else {
        await recreateVault(password);
      }

      // Set state in app as it was with password
      await SecureKeychain.resetGenericPassword();
      if (biometryType && biometryChoice) {
        try {
          await SecureKeychain.setGenericPassword(
            password,
            SecureKeychain.TYPES.BIOMETRICS
          );
        } catch (error) {
          if (Device.isIos()) await handleRejectedOsBiometricPrompt(error);
          throw error;
        }
      } else if (rememberMe) {
        await SecureKeychain.setGenericPassword(
          password,
          SecureKeychain.TYPES.REMEMBER_ME
        );
      } else {
        await SecureKeychain.resetGenericPassword();
      }
      await storage.save(storage.KEYS.existingUser, storage.VALUES.true);
      await storage.remove(storage.KEYS.seedPhraseHints);
      // this.props.passwordSet();
      // this.props.logIn();
      // this.props.setLockTime(AppConstants.DEFAULT_LOCK_TIMEOUT);
      setLoading(false);
      // this.props.navigation.replace("AccountBackupStep1");
    } catch (error) {
      await recreateVault("");
      // Set state in app as it was with no password
      await SecureKeychain.resetGenericPassword();
      await storage.remove(storage.KEYS.nextMakerReminder);
      await storage.save(storage.KEYS.existingUser, storage.VALUES.true);
      await storage.remove(storage.KEYS.seedPhraseHints);
      // this.props.passwordUnset();
      // this.props.setLockTime(-1);
      // Should we force people to enable passcode / biometrics?
      if (error.toString() === PASSCODE_NOT_SET_ERROR) {
        Alert.alert(
          i18n.t("securityAlertTitle"),
          i18n.t("securityAlertMessage")
        );
        setLoading(false);
      } else {
        setLoading(false);
        setError(error?.toString());
      }
    }
  }

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
        <BackButton />
      </View>
      {loading ? (
        <View style={styles.loadingWrapper}>
          <View style={styles.iconWrapper}>
            <IconFont
              name="snapshot"
              size={20}
              color={colors.yellow}
              style={styles.image}
            />
          </View>
          <ActivityIndicator size="large" color={colors.textColor} />
          <Text style={styles.title}>
            {i18n.t(
              previousScreen === ONBOARDING
                ? "createWallet"
                : "creatingPassword"
            )}
          </Text>
          <Text style={styles.subtitle}>{i18n.t("createWalletSubtitle")}</Text>
        </View>
      ) : (
        <View style={[styles.wrapper, { backgroundColor: colors.bgDefault }]}>
          <View style={{ paddingHorizontal: 16 }}>
            <OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} />
          </View>
          <KeyboardAwareScrollView
            style={styles.scrollableWrapper}
            contentContainerStyle={styles.keyboardScrollableWrapper}
            resetScrollToCoords={{ x: 0, y: 0 }}
          >
            <View testID={"create-password-screen"}>
              <View style={styles.content}>
                <Text style={[styles.title, { color: colors.textColor }]}>
                  {i18n.t("choosePasswordTitle")}
                </Text>
                <View style={styles.text}>
                  <Text style={[styles.subtitle, { color: colors.textColor }]}>
                    {i18n.t("choosePasswordSubtitle")}
                  </Text>
                </View>
              </View>
              <View style={styles.field}>
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
                  style={[
                    styles.input,
                    inputWidth,
                    { color: colors.textColor },
                  ]}
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
                        styles[
                          `strength_${passwordStrengthWord?.toLowerCase()}`
                        ]
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
                  ref={confirmPasswordInputRef}
                  style={[
                    styles.input,
                    inputWidth,
                    { color: colors.textColor },
                  ]}
                  value={confirmPassword}
                  onChangeText={(text: string) => {
                    setConfirmPassword(text);
                  }}
                  secureTextEntry={secureTextEntry}
                  placeholder={""}
                  placeholderTextColor={colors.darkGray}
                  onSubmitEditing={onPressCreate}
                  returnKeyType={"done"}
                  autoCapitalize="none"
                />
                <View style={styles.showMatchingPasswords}>
                  {passwordsMatch ? (
                    <IconFont name="check" size={20} color={colors.bgGreen} />
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
                    <>
                      <Text style={styles.biometryLabel}>
                        {i18n.t(
                          `biometrics.enable_${biometryType?.toLowerCase()}`
                        )}
                      </Text>
                      <View>
                        <Switch
                          onValueChange={async (biometryChoice: boolean) => {
                            if (!biometryChoice) {
                              await storage.save(
                                storage.KEYS.biometryChoiceDisabled,
                                "TRUE"
                              );
                            } else {
                              await storage.remove(
                                storage.KEYS.biometryChoiceDisabled
                              );
                            }

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
                    </>
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.biometryLabel,
                          { color: colors.textColor },
                        ]}
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
                    </>
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
                  tintColors={{ true: colors.bgBlue }}
                  boxType="square"
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
                onPress={onPressCreate}
                disabled={!canSubmit}
                title={i18n.t("choosePasswordTitle")}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

export default ChoosePasswordScreen;
