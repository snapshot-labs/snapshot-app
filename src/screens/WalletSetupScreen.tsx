import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import i18n from "i18n-js";
import { useAuthState } from "context/authContext";
import Device from "helpers/device";
import fontStyles from "styles/fonts";
import colors from "constants/colors";
import Button from "components/Button";
import IconFont from "components/IconFont";
import common from "styles/common";
import { useNavigation } from "@react-navigation/native";
import { CHOOSE_PASSWORD_SCREEN, ONBOARDING } from "constants/navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "components/BackButton";

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: Device.isIos() ? 90 : 45,
    height: Device.isIos() ? 90 : 45,
    marginVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    alignSelf: "center",
    width: Device.isIos() ? 90 : 45,
    height: Device.isIos() ? 90 : 45,
  },
  termsAndConditions: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    color: colors.textColor,
    ...fontStyles.bold,
    textAlign: "center",
  },
  ctas: {
    flex: 1,
    position: "relative",
  },
  buttonDescription: {
    ...fontStyles.normal,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 16,
    color: colors.textColor,
    lineHeight: 20,
  },
  importWrapper: {
    marginTop: 8,
  },
  createWrapper: {
    flex: 1,
    marginTop: 24,
    marginBottom: 24,
  },
  buttonWrapper: {
    marginBottom: 16,
  },
  loader: {
    marginTop: 180,
    justifyContent: "center",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 30,
    fontSize: 14,
    textAlign: "center",
    color: colors.textColor,
    ...fontStyles.normal,
  },
  modalTypeView: {
    position: "absolute",
    bottom: 0,
    paddingBottom: Device.isIphoneX() ? 20 : 10,
    left: 0,
    right: 0,
    backgroundColor: colors.transparent,
  },
  notificationContainer: {
    flex: 0.1,
    flexDirection: "row",
    alignItems: "flex-end",
  },
});

function WalletSetupScreen() {
  const { colors } = useAuthState();
  const [loading, setLoading] = useState(false);
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <View
        style={[
          common.headerContainer,
          common.justifySpaceBetween,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("walletSetup")} />
      </View>
      <ScrollView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.wrapper}>
          <View style={styles.iconWrapper}>
            <IconFont name={"snapshot"} size={40} color={colors.yellow} />
          </View>
          {loading ? (
            <View style={styles.wrapper}>
              <View style={styles.loader}>
                <ActivityIndicator size="small" color={colors.textColor} />
                <Text style={styles.loadingText}>{i18n.t("loading")}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.ctas}>
              <View style={styles.importWrapper}>
                <Text
                  style={[
                    styles.buttonDescription,
                    { color: colors.textColor },
                  ]}
                >
                  {i18n.t("importAnExistingWallet")}
                </Text>
              </View>
              <View style={styles.createWrapper}>
                <View style={styles.buttonWrapper}>
                  <Button
                    onPress={() => {}}
                    title={i18n.t("importFromSeedButton")}
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button
                    onPress={() => {
                      navigation.navigate(CHOOSE_PASSWORD_SCREEN, {
                        previousScreen: ONBOARDING,
                      });
                    }}
                    title={i18n.t("createANewWallet")}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default WalletSetupScreen;
