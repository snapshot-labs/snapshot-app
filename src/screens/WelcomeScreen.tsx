import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "i18n-js";
import common from "styles/common";
import IconFont from "components/IconFont";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { HOME_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";
import appConstants from "constants/app";
import ConnectWalletButton from "components/wallet/ConnectWalletButton";
import TrackWalletButton from "components/wallet/TrackWalletButton";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
  },
  welcomeText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 28,
    marginTop: 24,
    marginBottom: 16,
  },
  logoWelcomeTextContainer: {
    alignItems: "center",
  },
  snapshotIconContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 6,
  },
  actionButtonContainer: {
    paddingHorizontal: 16,
  },
  description: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginBottom: 24,
  },
});

function WelcomeScreen() {
  const { colors } = useAuthState();
  const authDispatch = useAuthDispatch();
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View style={styles.content}>
        <View style={styles.logoWelcomeTextContainer}>
          <View
            style={[
              styles.snapshotIconContainer,
              { borderColor: colors.borderColor },
            ]}
          >
            <IconFont name="snapshot" size={40} color={colors.yellow} />
          </View>
          <Text style={[styles.welcomeText, { color: colors.textColor }]}>
            {i18n.t("welcomeToSnapshot")}
          </Text>
          <Text style={[styles.description, { color: colors.darkGray }]}>
            {i18n.t("whereDecisionsGetMade")}
          </Text>
        </View>
        <View style={styles.actionButtonContainer}>
          <ConnectWalletButton
            onSuccess={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: HOME_SCREEN }],
              });
            }}
          />
          <View style={{ marginVertical: 6 }} />
          <TrackWalletButton
            onSuccess={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: HOME_SCREEN }],
              });
            }}
          />
          <View
            style={{
              marginTop: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Calibre-Medium",
                fontSize: 18,
                color: colors.darkGray,
                textTransform: "uppercase",
              }}
            >
              {i18n.t("or")}
            </Text>
            <TouchableOpacity
              onPress={() => {
                authDispatch({
                  type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
                  payload: {
                    connectedAddress: appConstants.ANONYMOUS_ADDRESS,
                    addToStorage: true,
                    addToSavedWallets: true,
                  },
                });
                navigation.reset({
                  index: 0,
                  routes: [{ name: HOME_SCREEN }],
                });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Calibre-Semibold",
                    fontSize: 22,
                    color: colors.textColor,
                    marginRight: 6,
                  }}
                >
                  {i18n.t("takeATour")}
                </Text>
                <IconFont name="go" size={28} color={colors.textColor} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default WelcomeScreen;
