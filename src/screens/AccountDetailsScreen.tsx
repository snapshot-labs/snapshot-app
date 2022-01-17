import React from "react";
import { Text, TouchableHighlight, View } from "react-native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import BackButton from "components/BackButton";
import IconFont from "components/IconFont";
import styles, { ICON_SIZE } from "styles/settings";
import { SHOW_PRIVATE_KEY_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";

function AccountDetailsScreen() {
  const { colors, connectedAddress } = useAuthState();
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();

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
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("accountDetails")} />
      </View>
      <View style={{ marginTop: 8, flex: 1 }}>
        <TouchableHighlight
          onPress={() => {
            navigation.navigate(SHOW_PRIVATE_KEY_SCREEN, {
              selectedAddress: connectedAddress,
              privateCredentialName: "privateKey",
            });
          }}
          underlayColor={colors.highlightColor}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.settingsIconBgColor },
              ]}
            >
              <IconFont name="signature" size={18} color={colors.textColor} />
            </View>
            <Text
              style={[
                styles.rowTitle,
                { color: colors.textColor, marginLeft: 8 },
              ]}
            >
              {i18n.t("showPrivateKey")}
            </Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={() => {
            navigation.navigate(SHOW_PRIVATE_KEY_SCREEN, {
              selectedAddress: connectedAddress,
              privateCredentialName: "secretRecoveryPhrase",
            });
          }}
          underlayColor={colors.highlightColor}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.settingsIconBgColor },
              ]}
            >
              <IconFont
                name="receipt-outlined"
                size={24}
                color={colors.textColor}
              />
            </View>
            <Text
              style={[
                styles.rowTitle,
                { color: colors.textColor, marginLeft: 8 },
              ]}
            >
              {i18n.t("revealSecretRecoveryPhrase")}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    </View>
  );
}

export default AccountDetailsScreen;
