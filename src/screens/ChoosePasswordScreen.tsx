import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import TextInput from "components/TextInput";
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
import {
  ONBOARDING,
  SEED_PHRASE_BACKUP_STEP1_SCREEN,
} from "constants/navigation";
import SecureKeychain from "helpers/secureKeychain";
import IconFont from "components/IconFont";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import common from "styles/common";
import BackButton from "components/BackButton";
import {
  ENGINE_ACTIONS,
  useEngineDispatch,
  useEngineState,
} from "context/engineContext";
import { useNavigation } from "@react-navigation/native";

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
    justifyContent: "center",
    alignItems: "center",
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
  const { keyRingController, preferencesController } = useEngineState();
  const authDispatch = useAuthDispatch();
  const engineDispatch = useEngineDispatch();
  const CHOOSE_PASSWORD_STEPS = createChoosePasswordSteps();
  const [isSelected, setIsSelected] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [biometryType, setBiometryType] = useState<null | string>(null);
  const [biometryChoice, setBiometryChoice] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const passwordStrengthWord = getPasswordStrengthWord(passwordStrength);
  const confirmPasswordInputRef = useRef(null);
  const passwordsMatch = password !== "" && password === confirmPassword;
  const canSubmit = passwordsMatch && isSelected;
  const navigation: any = useNavigation();
  const previousScreen = route?.params?.previousScreen;

  async function checkBiometryType() {
    if (Device.isIos()) {
      const biometryType = await SecureKeychain.getSupportedBiometryType();
      if (biometryType) {
        setBiometryType(Device.isAndroid() ? "biometrics" : biometryType);
        setBiometryChoice(true);
      }
    }
  }

  async function handleRejectedOsBiometricPrompt(error: Error) {
    const biometryType = await SecureKeychain.getSupportedBiometryType();
    if (error.toString().includes(IOS_DENY_BIOMETRIC_ERROR) && !biometryType) {
      setBiometryType(biometryType);
      setBiometryChoice(true);
      throw Error(i18n.t("disableBiometricError"));
    }
  }

  async function getSeedPhrase() {
    const mnemonic = await keyRingController.exportSeedPhrase(password);
    return JSON.stringify(mnemonic).replace(/"/g, "");
  }

  async function recreateVault(password: string) {
    const seedPhrase = await getSeedPhrase();

    let importedAccounts: any[] = [];
    try {
      // Get imported accounts
      const simpleKeyrings = keyRingController.state.keyrings.filter(
        (keyring: any) => keyring.type === "Simple Key Pair"
      );
      for (let i = 0; i < simpleKeyrings.length; i++) {
        const simpleKeyring = simpleKeyrings[i];
        const simpleKeyringAccounts = await Promise.all(
          simpleKeyring.accounts.map((account: string) =>
            keyRingController.exportAccount(password, account)
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
    await keyRingController.createNewVaultAndRestore(password, seedPhrase);
    // Keyring is set with empty password or not

    // Get props to restore vault
    const hdKeyring = keyRingController.state.keyrings[0];
    const existingAccountCount = hdKeyring.accounts.length;
    const selectedAddress = "CHANGE THIS LATER";
    let preferencesControllerState = preferencesController.state;

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
    } catch (e) {
      console.log(e, "error while trying to import accounts on recreate vault");
    }

    // Reset preferencesControllerState
    preferencesControllerState = preferencesController.state;

    // Set preferencesControllerState again
    await preferencesController.update(preferencesControllerState);
    // Reselect previous selected account if still available
    if (hdKeyring.accounts.includes(selectedAddress)) {
      preferencesController.setSelectedAddress(selectedAddress);
    } else {
      preferencesController.setSelectedAddress(hdKeyring.accounts[0]);
    }
  }

  async function createNewVaultAndKeychain(password: string) {
    try {
      const keyRingControllState =
        await keyRingController.createNewVaultAndKeychain(password);
      storage.save(
        storage.KEYS.keyRingControllerState,
        JSON.stringify(keyRingControllState)
      );
    } catch (e) {
      console.log("KEY RING ERROR", e);
    }
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
      const previousScreen = route.params?.previousScreen;

      if (previousScreen === ONBOARDING) {
        await createNewVaultAndKeychain(password);
        engineDispatch({
          type: ENGINE_ACTIONS.SEEDPHRASE_NOT_BACKED_UP,
        });
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

      const accounts = await keyRingController.getAccounts();
      authDispatch({
        type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
        payload: {
          connectedAddress: accounts[0],
          addToStorage: true,
          addToSavedWallets: true,
          isSnapshotWallet: true,
        },
      });
      await storage.save(
        storage.KEYS.snapshotWallets,
        JSON.stringify(accounts)
      );
      await storage.save(storage.KEYS.passwordSet, storage.VALUES.true);
      engineDispatch({
        type: ENGINE_ACTIONS.PASSWORD_SET,
      });
      authDispatch({
        type: AUTH_ACTIONS.SET_SNAPSHOT_WALLETS,
        payload: accounts,
      });
      setLoading(false);
      navigation.replace(SEED_PHRASE_BACKUP_STEP1_SCREEN);
    } catch (error) {
      console.log("FAILED TO CREATE", error);
      await recreateVault("");

      await SecureKeychain.resetGenericPassword();
      engineDispatch({
        type: ENGINE_ACTIONS.PASSWORD_UNSET,
      });
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

  useEffect(() => {
    checkBiometryType();
  }, []);

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
        <BackButton title={i18n.t("choosePasswordTitle")} />
      </View>
      {loading ? (
        <View style={styles.loadingWrapper}>
          <View style={styles.iconWrapper}>
            <IconFont name="snapshot" size={40} color={colors.yellow} />
          </View>
          <ActivityIndicator size="large" color={colors.textColor} />
          <Text style={[styles.title, { color: colors.textColor }]}>
            {i18n.t(
              previousScreen === ONBOARDING
                ? "createWallet"
                : "creatingPassword"
            )}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textColor }]}>
            {i18n.t("createWalletSubtitle")}
          </Text>
        </View>
      ) : (
        <View style={[styles.wrapper, { backgroundColor: colors.bgDefault }]}>
          <View style={{ paddingHorizontal: 16, marginLeft: -16 }}>
            <OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} />
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
                  setRef={confirmPasswordInputRef}
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
                        style={[
                          styles.biometryLabel,
                          { color: colors.textColor },
                        ]}
                      >
                        {i18n.t(
                          `biometrics.enable_${biometryType?.toLowerCase()}`
                        )}
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
