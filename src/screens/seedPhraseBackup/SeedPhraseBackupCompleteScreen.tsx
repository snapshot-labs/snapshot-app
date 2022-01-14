import Device from "helpers/device";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { fontStyles } from "styles/fonts";
import colors from "constants/colors";
import Emoji from "react-native-emoji";
import i18n from "i18n-js";
import { SafeAreaView } from "react-native-safe-area-context";
import common from "styles/common";
import BackButton from "components/BackButton";
import { useAuthState } from "context/authContext";
import Button from "components/Button";
import { useNavigation } from "@react-navigation/native";
import OnboardingProgress from "components/wallet/OnboardingProgress";
import { createChoosePasswordSteps } from "constants/onboarding";
import Confetti from "components/wallet/Confetti";
import { HOME_SCREEN } from "constants/navigation";

const styles = StyleSheet.create({
  actionView: {
    paddingTop: 40,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 50,
  },
  onBoardingWrapper: {
    paddingHorizontal: 20,
  },
  congratulations: {
    fontSize: Device.isMediumDevice() ? 28 : 32,
    marginBottom: 24,
    color: colors.textColor,
    justifyContent: "center",
    textAlign: "center",
    ...fontStyles.bold,
  },
  baseText: {
    fontSize: 18,
    color: colors.textColor,
    textAlign: "center",
    ...fontStyles.normal,
    lineHeight: 20,
  },
  successText: {
    marginBottom: 24,
  },
  hintText: {
    marginBottom: 26,
    color: colors.bgBlue,
  },
  learnText: {
    color: colors.bgBlue,
  },
  recoverText: {
    marginBottom: 26,
  },
  emoji: {
    textAlign: "center",
    fontSize: 65,
    marginBottom: 16,
    marginTop: 24,
  },
});

function SeedPhraseBackupCompleteScreen() {
  const { colors } = useAuthState();
  const navigation: any = useNavigation();
  const CHOOSE_PASSWORD_STEPS = createChoosePasswordSteps();
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
      <View style={styles.wrapper}>
        <Confetti />
        <View style={{ paddingHorizontal: 16, marginLeft: -16, marginTop: 24 }}>
          <OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} currentStep={4} />
        </View>
        <Emoji name="tada" style={styles.emoji} />
        <Text style={[styles.congratulations, { color: colors.textColor }]}>
          {i18n.t("manual_backup_step_3.congratulations")}
        </Text>
        <Text
          style={[
            styles.baseText,
            styles.successText,
            { color: colors.textColor },
          ]}
        >
          {i18n.t("manual_backup_step_3.success")}
        </Text>
        <Text
          style={[
            styles.baseText,
            styles.recoverText,
            { color: colors.textColor },
          ]}
        >
          {i18n.t("manual_backup_step_3.recover")}
        </Text>
      </View>
      <View style={{ paddingHorizontal: 16, marginBottom: 30 }}>
        <Button
          onPress={() => {
            navigation.navigate(HOME_SCREEN, {
              screen: "More",
            });
          }}
          title={i18n.t("manual_backup_step_3.done")}
        />
      </View>
    </SafeAreaView>
  );
}

export default SeedPhraseBackupCompleteScreen;
