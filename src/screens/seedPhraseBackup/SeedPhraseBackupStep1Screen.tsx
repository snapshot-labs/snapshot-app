import React from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import i18n from "i18n-js";
import { useEffect, useState } from "react";
import colors from "constants/colors";
import { fontStyles } from "styles/fonts";
import OnboardingProgress from "components/wallet/OnboardingProgress";
import {
  createChoosePasswordSteps,
  WRONG_PASSWORD_ERROR,
} from "constants/onboarding";
import Button from "components/Button";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import SeedPhraseModal from "components/wallet/SeedPhraseModal";
import common from "styles/common";
import FeatherIcons from "react-native-vector-icons/Feather";
import { BlurView } from "@react-native-community/blur";
import SecureKeyChain from "helpers/secureKeychain";
import Device from "helpers/device";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useEngineState } from "context/engineContext";
import { useAuthState } from "context/authContext";
import { SEED_PHRASE_BACKUP_STEP2_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";
import storage from "helpers/storage";
import BackButton from "components/BackButton";

const styles = StyleSheet.create({
  scrollviewWrapper: {
    flexGrow: 1,
  },
  wrapper: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    paddingBottom: 0,
  },
  content: {
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  text: {
    marginTop: 32,
    justifyContent: "center",
  },
  manualBackupPasswordDescription: {
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    lineHeight: 20,
    fontSize: 18,
    color: colors.textColor,
    ...fontStyles.normal,
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bold: {
    ...fontStyles.bold,
  },
  remindLaterContainer: {
    marginBottom: 34,
  },
  remindLaterButton: {
    elevation: 10,
    zIndex: 10,
  },
  ctaContainer: {
    marginBottom: 30,
  },
  seedPhraseWrapper: {
    backgroundColor: colors.white,
    borderRadius: 8,
    flexDirection: "row",
    borderColor: colors.borderColor,
    borderWidth: 1,
    marginBottom: 64,
    minHeight: 275,
  },
  wordColumn: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Device.isMediumDevice() ? 18 : 24,
    paddingVertical: 18,
    justifyContent: "space-between",
  },
  wordWrapper: {
    flexDirection: "row",
  },
  word: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: colors.textColor,
    backgroundColor: colors.white,
    borderColor: colors.bgBlue,
    borderWidth: 1,
    borderRadius: 13,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 14,
    flex: 1,
  },
  infoWrapper: {
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    color: colors.textColor,
    ...fontStyles.normal,
    lineHeight: 20,
  },
  seedPhraseConcealer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: colors.darkGray,
    opacity: 0.7,
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 45,
  },
  touchableOpacity: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  reveal: {
    fontSize: 18,
    ...fontStyles.bold,
    color: colors.white,
    lineHeight: 22,
    marginBottom: 8,
    textAlign: "center",
  },
  blurView: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderRadius: 8,
  },
  watching: {
    fontSize: 18,
    color: colors.white,
    marginBottom: 32,
    lineHeight: 20,
    textAlign: "center",
    ...fontStyles.normal,
  },
  action: {
    fontSize: 18,
    marginVertical: 16,
    color: colors.textColor,
    justifyContent: "center",
    textAlign: "center",
    ...fontStyles.bold,
  },
  icon: {
    width: 24,
    height: 24,
    color: colors.white,
    textAlign: "center",
    marginBottom: 32,
  },
  keyboardAvoidingView: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "center",
  },
  confirmPasswordWrapper: {
    flex: 1,
    paddingTop: 0,
  },
  passwordRequiredContent: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 2,
    borderRadius: 5,
    width: "100%",
    borderColor: colors.borderColor,
    padding: 10,
    fontSize: 16,
    height: 50,
    ...fontStyles.normal,
  },
  title: {
    fontSize: 20,
    marginTop: 16,
    color: colors.textColor,
    ...fontStyles.normal,
  },
  warningMessageText: {
    paddingVertical: 10,
    color: colors.red,
    ...fontStyles.normal,
  },
});

function SeedPhraseBackupScreen() {
  const { colors } = useAuthState();
  const { keyRingController, preferencesController } = useEngineState();
  const CHOOSE_PASSWORD_STEPS = createChoosePasswordSteps();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const [bottomSheetModalKey, setBottomSheetModalKey] = useState(1);
  const [seedPhraseHidden, setSeedPhraseHidden] = useState(true);
  const [words, setWords] = useState<string[]>([]);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [warningIncorrectPassword, setWarningIncorrectPassword] = useState<
    string | null
  >(null);
  const wordLength = words.length;
  const [password, setPassword] = useState("");
  const half = wordLength / 2 || 6;
  const navigation: any = useNavigation();

  async function tryUnlockWithPassword() {
    try {
      const words = await tryExportSeedPhrase(password);
      setWords(words);
      setShowConfirmPassword(false);
    } catch (e) {
      let msg = i18n.t("reveal_credential.warning_incorrect_password");
      if (e.toString().toLowerCase() !== WRONG_PASSWORD_ERROR.toLowerCase()) {
        msg = i18n.t("reveal_credential.unknown_error");
      }
      setWarningIncorrectPassword(msg);
    }
  }

  async function setSeed() {
    const credentials = await SecureKeyChain.getGenericPassword();
    if (credentials) {
      const mnemonic = await keyRingController.exportSeedPhrase(
        credentials.password
      );
      const seed = JSON.stringify(mnemonic).replace(/"/g, "").split(" ");
      setWords(seed);
    } else {
      setShowConfirmPassword(true);
    }
  }

  async function tryExportSeedPhrase(password: string) {
    const mnemonic = await keyRingController.exportSeedPhrase(password);
    return JSON.stringify(mnemonic).replace(/"/g, "").split(" ");
  }

  useEffect(() => {
    setSeed();
    storage.save(
      storage.KEYS.preferencesControllerState,
      JSON.stringify(preferencesController.state)
    );
  }, []);

  const goNext = () => {
    navigation.navigate(SEED_PHRASE_BACKUP_STEP2_SCREEN, { words });
  };

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
        <BackButton title={i18n.t("manual_backup_step_1.action")} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollviewWrapper}
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        <View style={styles.wrapper}>
          <View
            style={{ paddingHorizontal: 16, marginLeft: -16, marginTop: 24 }}
          >
            <OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} currentStep={1} />
          </View>
          <View style={styles.content}>
            <View style={styles.text}>
              <Text style={[styles.label, { color: colors.textColor }]}>
                {i18n.t("account_backup_step_1.info_text_1_1")}{" "}
                <Text
                  style={{ color: colors.bgBlue }}
                  onPress={() => {
                    bottomSheetModalDispatch({
                      type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                      payload: {
                        snapPoints: [10, 450],
                        initialIndex: 1,
                        show: true,
                        key: `seed-phrase-modal-${bottomSheetModalKey}`,
                        options: [],
                        onPressOption: () => {},
                        ModalContent: () => (
                          <SeedPhraseModal
                            hideWhatIsSeedphrase={() => {
                              bottomSheetModalRef?.current?.close();
                            }}
                          />
                        ),
                      },
                    });

                    setBottomSheetModalKey(bottomSheetModalKey + 1);
                  }}
                >
                  {i18n.t("account_backup_step_1.info_text_1_2")}
                </Text>{" "}
                {i18n.t("account_backup_step_1.info_text_1_3")}{" "}
                <Text style={[styles.bold, { color: colors.textColor }]}>
                  {i18n.t("account_backup_step_1.info_text_1_4")}
                </Text>
              </Text>
            </View>
          </View>
          {showConfirmPassword ? (
            <KeyboardAvoidingView
              style={styles.keyboardAvoidingView}
              behavior={"padding"}
            >
              <KeyboardAwareScrollView
                style={[common.screen, { backgroundColor: colors.bgDefault }]}
                enableOnAndroid
              >
                <View style={styles.confirmPasswordWrapper}>
                  <View
                    style={[styles.content, styles.passwordRequiredContent]}
                  >
                    <Text style={[styles.title, { color: colors.textColor }]}>
                      {i18n.t("manual_backup_step_1.confirm_password")}
                    </Text>
                    <View style={styles.manualBackupPasswordDescription}>
                      <Text style={[styles.label, { color: colors.textColor }]}>
                        {i18n.t("manual_backup_step_1.before_continiuing")}
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderColor: colors.borderColor,
                          color: colors.textColor,
                        },
                      ]}
                      placeholder={i18n.t("password")}
                      placeholderTextColor={colors.darkGray}
                      onChangeText={(pass: string) => {
                        setPassword(pass);
                      }}
                      secureTextEntry
                      onSubmitEditing={tryUnlockWithPassword}
                      autoCapitalize="none"
                    />
                    {warningIncorrectPassword && (
                      <Text style={styles.warningMessageText}>
                        {warningIncorrectPassword}
                      </Text>
                    )}
                  </View>
                  <View style={styles.buttonWrapper}>
                    <Button
                      onPress={tryUnlockWithPassword}
                      title={i18n.t("manual_backup_step_1.confirm")}
                    />
                  </View>
                </View>
              </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
          ) : (
            <View>
              <View style={styles.infoWrapper}>
                <Text style={[styles.info, { color: colors.textColor }]}>
                  {i18n.t("manual_backup_step_1.info")}
                </Text>
              </View>
              <View style={styles.seedPhraseWrapper}>
                <View style={styles.wordColumn}>
                  {words.slice(0, half).map((word, i) => (
                    <View key={`word_${i}`} style={styles.wordWrapper}>
                      <Text style={styles.word}>{`${i + 1}. ${word}`}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.wordColumn}>
                  {words.slice(-half).map((word, i) => (
                    <View key={`word_${i}`} style={styles.wordWrapper}>
                      <Text style={styles.word}>{`${
                        i + (half + 1)
                      }. ${word}`}</Text>
                    </View>
                  ))}
                </View>
                {seedPhraseHidden && (
                  <React.Fragment>
                    <TouchableOpacity
                      onPress={() => {
                        setSeedPhraseHidden(false);
                      }}
                      style={styles.touchableOpacity}
                    >
                      <BlurView
                        blurType="light"
                        blurAmount={5}
                        style={styles.blurView}
                      />
                      <View style={styles.seedPhraseConcealer}>
                        <FeatherIcons
                          name="eye-off"
                          size={24}
                          style={styles.icon}
                        />
                        <Text style={styles.reveal}>
                          {i18n.t("manual_backup_step_1.reveal")}
                        </Text>
                        <Text style={styles.watching}>
                          {i18n.t("manual_backup_step_1.watching")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                )}
              </View>
            </View>
          )}
          {!showConfirmPassword && (
            <View style={styles.buttonWrapper}>
              <View style={styles.ctaContainer}>
                <Button
                  disabled={seedPhraseHidden}
                  onPress={goNext}
                  title={i18n.t("account_backup_step_1.continue")}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default SeedPhraseBackupScreen;
