import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput as TextInputComponent,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import colors from "constants/colors";
import Device from "helpers/device";
import fontStyles from "styles/fonts";
import i18n from "i18n-js";
import Icon from "react-native-vector-icons/FontAwesome";
import TextInput from "components/TextInput";
import {
  getPasswordStrengthWord,
  MIN_PASSWORD_LENGTH,
  passwordRequirementsMet,
} from "helpers/password";
import zxcvbn from "zxcvbn";
import Button from "components/Button";
import TermsAndConditions from "components/wallet/TermsAndConditions";
import {
  failedSeedPhraseRequirements,
  parseSeedPhrase,
  parseVaultValue,
} from "helpers/validators";
import { isValidMnemonic, Logger } from "ethers/lib/utils";
import {
  ENGINE_ACTIONS,
  useEngineDispatch,
  useEngineState,
} from "context/engineContext";
import storage from "helpers/storage";
import SecureKeychain from "helpers/secureKeychain";
import importAdditionalAccounts from "helpers/importAdditionalAccounts";
import { HOME_SCREEN, QR_CODE_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import common from "styles/common";
import BackButton from "components/BackButton";

const styles = StyleSheet.create({
  mainWrapper: {
    backgroundColor: colors.white,
    flex: 1,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 24,
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
  field: {
    marginVertical: 5,
    position: "relative",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  fieldCol: {
    width: "70%",
  },
  fieldColRight: {
    flexDirection: "row-reverse",
    width: "30%",
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
    ...fontStyles.normal,
  },
  ctaWrapper: {
    marginTop: 20,
  },
  errorMsg: {
    color: colors.red,
    textAlign: "center",
    ...fontStyles.normal,
  },
  seedPhrase: {
    marginBottom: 10,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    fontSize: 20,
    borderRadius: 10,
    minHeight: 110,
    height: "auto",
    borderWidth: 1,
    borderColor: colors.borderColor,
    backgroundColor: colors.white,
    ...fontStyles.normal,
  },
  padding: {
    paddingRight: 46,
  },
  biometrics: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",

    marginTop: 10,
  },
  biometryLabel: {
    flex: 1,
    fontSize: 18,
    color: colors.black,
    ...fontStyles.normal,
  },
  biometrySwitch: {
    marginTop: 10,
    flex: 0,
  },
  termsAndConditions: {
    paddingVertical: 10,
  },
  passwordStrengthLabel: {
    height: 20,
    fontSize: 18,
    ...fontStyles.normal,
    marginTop: 16,
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
  qrCode: {
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: colors.borderColor,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginTop: -40,
    marginBottom: 30,
    alignSelf: "flex-end",
  },
  inputFocused: {
    borderColor: colors.bgBlue,
    borderWidth: 2,
  },
  input: {
    ...fontStyles.normal,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 6,
    height: 50,
    padding: 10,
    ...fontStyles.normal,
  },
});

const PASSCODE_NOT_SET_ERROR = "Error: Passcode not set.";

function ImportFromSeedScreen() {
  const { colors } = useAuthState();
  const { keyRingController, preferencesController, networkController } =
    useEngineState();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seed, setSeed] = useState("");
  const [biometryType, setBiometryType] = useState<null | string>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [biometryChoice, setBiometryChoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seedPhraseInputFocused, setSeedphraseInputFocused] = useState(false);
  const [hideSeedPhraseInput, setHideSeedPhraseInput] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const passwordStrengthWord = getPasswordStrengthWord(passwordStrength);
  const passwordInputRef: any = useRef(null);
  const confirmPasswordInputRef: any = useRef(null);
  const authDispatch = useAuthDispatch();
  const navigation: any = useNavigation();
  const engineDispatch = useEngineDispatch();

  async function onPressImport() {
    const vaultSeed = await parseVaultValue(password, seed);
    const parsedSeed = parseSeedPhrase(vaultSeed || seed);
    //Set the seed state with a valid parsed seed phrase (handle vault scenario)
    setSeed(parsedSeed);

    let error = null;
    if (!passwordRequirementsMet(password)) {
      error = i18n.t("import_from_seed.password_length_error");
    } else if (password !== confirmPassword) {
      error = i18n.t("import_from_seed.password_dont_match");
    }

    if (failedSeedPhraseRequirements(parsedSeed)) {
      error = i18n.t("import_from_seed.seed_phrase_requirements");
    } else if (!isValidMnemonic(parsedSeed)) {
      error = i18n.t("import_from_seed.invalid_seed_phrase");
    }

    if (error) {
      Alert.alert(i18n.t("import_from_seed.error"), error);
    } else {
      try {
        setLoading(true);

        await storage.remove(storage.KEYS.nextMakerReminder);
        const vault = await keyRingController.createNewVaultAndRestore(
          password,
          parsedSeed
        );
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
        await storage.save(storage.KEYS.existingUser, storage.VALUES.true);
        await storage.save(
          storage.KEYS.snapshotWallets,
          JSON.stringify(accounts)
        );

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
        } else {
          await SecureKeychain.resetGenericPassword();
        }
        await storage.save(
          storage.KEYS.keyRingControllerState,
          JSON.stringify(vault)
        );
        await storage.save(storage.KEYS.existingUser, storage.VALUES.true);
        await storage.remove(storage.KEYS.seedPhraseHints);
        await storage.save(storage.KEYS.passwordSet, storage.VALUES.true);
        setLoading(false);
        engineDispatch({
          type: ENGINE_ACTIONS.PASSWORD_SET,
        });
        navigation.navigate(HOME_SCREEN, {
          screen: "More",
        });
        await importAdditionalAccounts(
          keyRingController,
          preferencesController,
          networkController
        );
      } catch (error) {
        // Should we force people to enable passcode / biometrics?
        if (error.toString() === PASSCODE_NOT_SET_ERROR) {
          Alert.alert(
            "Security Alert",
            "In order to proceed, you need to turn Passcode on or any biometrics authentication method supported in your device (FaceID, TouchID or Fingerprint)"
          );
          setLoading(false);
        } else {
          setLoading(false);
          setError(error.toString());
        }
      }
    }
  }

  async function initBiometryType() {
    const biometryType = await SecureKeychain.getSupportedBiometryType();
    if (biometryType) {
      let enabled = true;
      const previouslyDisabled: any = await storage.remove(
        storage.KEYS.biometryChoiceDisabled
      );
      if (previouslyDisabled && previouslyDisabled === storage.VALUES.true) {
        enabled = false;
      }
      setBiometryType(Device.isAndroid() ? "biometrics" : biometryType);
      setBiometryChoice(enabled);
    }
  }

  function toggleHideSeedPhraseInput() {
    setHideSeedPhraseInput(!hideSeedPhraseInput);
  }

  function setSeedphraseInputFocusedHelper() {
    setSeedphraseInputFocused(!seedPhraseInputFocused);
  }

  function jumpToPassword() {
    if (passwordInputRef.current) {
      passwordInputRef?.current?.focus();
    }
  }

  function jumpToConfirmPassword() {
    if (confirmPasswordInputRef.current) {
      confirmPasswordInputRef?.current?.focus();
    }
  }

  function renderSwitch() {
    if (biometryType) {
      return (
        <View style={styles.biometrics}>
          <Text style={[styles.biometryLabel, { color: colors.textColor }]}>
            {i18n.t(`biometrics.enable_${biometryType.toLowerCase()}`)}
          </Text>
          <Switch
            onValueChange={this.updateBiometryChoice}
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
      );
    }

    return (
      <View style={styles.biometrics}>
        <Text style={[styles.biometryLabel, { color: colors.textColor }]}>
          {i18n.t(`choosePasswordRememberMe`)}
        </Text>
        <Switch
          onValueChange={(rememberMe) => setRememberMe(rememberMe)}
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
    );
  }

  useEffect(() => {
    initBiometryType();
  }, []);

  return (
    <SafeAreaView
      style={[styles.mainWrapper, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("import_from_seed.title")} />
      </View>
      <KeyboardAwareScrollView
        style={styles.wrapper}
        resetScrollToCoords={{ x: 0, y: 0 }}
      >
        <View>
          <View style={styles.fieldRow}>
            <View style={styles.fieldCol}>
              <Text style={[styles.label, { color: colors.textColor }]}>
                {i18n.t("choosePasswordSeedPhrase")}
              </Text>
            </View>
            <View style={[styles.fieldCol, styles.fieldColRight]}>
              <TouchableOpacity
                onPress={() => {
                  setHideSeedPhraseInput(!hideSeedPhraseInput);
                }}
              >
                <Text style={[styles.label, { color: colors.textColor }]}>
                  {i18n.t(hideSeedPhraseInput ? "show" : "hide")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {hideSeedPhraseInput ? (
            <TextInput
              placeholder={i18n.t("import_from_seed.seed_phrase_placeholder")}
              returnKeyType="next"
              autoCapitalize="none"
              secureTextEntry={hideSeedPhraseInput}
              onChangeText={(seedText: string) => {
                setSeed(seedText);
              }}
              placeholderTextColor={colors.darkGray}
              value={seed}
              onSubmitEditing={jumpToPassword}
            />
          ) : (
            <TextInputComponent
              value={seed}
              numberOfLines={3}
              style={[
                styles.seedPhrase,
                seedPhraseInputFocused && styles.inputFocused,
              ]}
              secureTextEntry
              multiline={!hideSeedPhraseInput}
              placeholder={i18n.t("import_from_seed.seed_phrase_placeholder")}
              placeholderTextColor={colors.darkGray}
              onChangeText={(seedText: string) => {
                setSeed(seedText);
              }}
              blurOnSubmit
              onSubmitEditing={jumpToPassword}
              returnKeyType="next"
              keyboardType={
                (!hideSeedPhraseInput &&
                  Device.isAndroid() &&
                  "visible-password") ||
                "default"
              }
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={
                (!hideSeedPhraseInput && setSeedphraseInputFocusedHelper) ||
                null
              }
              onBlur={
                (!hideSeedPhraseInput && setSeedphraseInputFocusedHelper) ||
                null
              }
            />
          )}
          <TouchableOpacity
            style={styles.qrCode}
            onPress={() => {
              navigation.navigate(QR_CODE_SCREEN, {
                onScanSuccess: ({ seed = undefined }) => {
                  if (seed) {
                    setSeed(seed);
                  } else {
                    Alert.alert(
                      i18n.t("import_from_seed.invalid_qr_code_title"),
                      i18n.t("import_from_seed.invalid_qr_code_message")
                    );
                  }
                  toggleHideSeedPhraseInput();
                },
                onScanError: () => {
                  toggleHideSeedPhraseInput();
                },
              });
            }}
          >
            <Icon name="qrcode" size={20} color={colors.darkGray} />
          </TouchableOpacity>
          <View style={styles.field}>
            <View style={styles.fieldRow}>
              <View style={styles.fieldCol}>
                <Text style={[styles.label, { color: colors.textColor }]}>
                  {i18n.t("import_from_seed.new_password")}
                </Text>
              </View>
              <View style={[styles.fieldCol, styles.fieldColRight]}>
                <TouchableOpacity
                  onPress={() => {
                    setSecureTextEntry(!secureTextEntry);
                  }}
                >
                  <Text style={[styles.label, { color: colors.textColor }]}>
                    {i18n.t(secureTextEntry ? "show" : "hide")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              setRef={passwordInputRef}
              placeholder={i18n.t("import_from_seed.new_password")}
              placeholderTextColor={colors.darkGray}
              returnKeyType={"next"}
              autoCapitalize="none"
              secureTextEntry={secureTextEntry}
              onChangeText={(text: string) => {
                const passInfo = zxcvbn(text);
                setPassword(text);
                setPasswordStrength(passInfo.score);
              }}
              value={password}
              onSubmitEditing={jumpToConfirmPassword}
            />

            {(password !== "" && (
              <Text
                style={[
                  styles.passwordStrengthLabel,
                  { color: colors.textColor },
                ]}
              >
                {i18n.t("choosePasswordPasswordStrength")}
                <Text style={styles[`strength_${passwordStrengthWord}`]}>
                  {" "}
                  {i18n.t(`choosePasswordStrength${passwordStrengthWord}`)}
                </Text>
              </Text>
            )) || <Text style={styles.passwordStrengthLabel} />}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textColor }]}>
              {i18n.t("import_from_seed.confirm_password")}
            </Text>
            <TextInput
              setRef={confirmPasswordInputRef}
              onChangeText={(text: string) => {
                setConfirmPassword(text);
              }}
              returnKeyType={"next"}
              autoCapitalize="none"
              secureTextEntry={secureTextEntry}
              placeholder={i18n.t("import_from_seed.confirm_password")}
              placeholderTextColor={colors.darkGray}
              value={confirmPassword}
              onSubmitEditing={onPressImport}
            />

            <View style={styles.showMatchingPasswords}>
              {password !== "" && password === confirmPassword ? (
                <Icon name="check" size={12} color={colors.bgGreen} />
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
          {renderSwitch()}
          {!!error && <Text style={styles.errorMsg}>{error}</Text>}
          <View style={styles.ctaWrapper}>
            <Button
              onPress={onPressImport}
              disabled={!(password !== "" && password === confirmPassword)}
              loading={loading}
              title={i18n.t("import_from_seed.import_button")}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.termsAndConditions}>
        <TermsAndConditions />
      </View>
    </SafeAreaView>
  );
}

export default ImportFromSeedScreen;
